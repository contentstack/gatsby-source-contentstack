import contentstack from "contentstack"
import isEmpty from "lodash.isempty";
import { Storage } from "./storage-helper";

// max depth for nested references
const MAX_DEPTH_ALLOWED = 5;

export class ContentstackGatsby {
    config;
    stackSdk;
    contentTypes;
    referenceFields;
    referenceFieldPaths;

    constructor(config) {
        this.config = config;
        this.stackSdk = contentstack.Stack({
            api_key: config.api_key,
            delivery_token: "", // since we only use this to fetch data for live preview, we don't need this

            environment: config.environment,
            live_preview: {
                host: config.live_preview.host,
                management_token: config.live_preview.management_token,
                enable: config.live_preview.enable,
            }
        });


        // the SDK only makes call to cdn for getting content types
        // hence, we override the SDK config to force it to fetch the 
        // data from api
        this.stackSdk.setHost(config.live_preview.host);
        this.stackSdk.headers.authorization = config.live_preview?.management_token;

        // reference fields in various CTs and the CTs they refer
        this.referenceFieldsStorage = new Storage(window.sessionStorage, "reference_fields");
        this.referenceFields = this.referenceFieldsStorage.get();

        // only field paths extracted from the above map for current CT
        this.referenceFieldPaths = [];

        // store content types in LP site's session storage 
        this.contentTypesStorage = new Storage(window.sessionStorage, "content_types");
        this.contentTypes = this.contentTypesStorage.get();
    }

    async fetchContentTypes(uids) {
        try {
            const result = await this.stackSdk.getContentTypes({
                query: {"uid": {"$in": uids}}
            })
            if (result) {
                const contentTypes = {};
                result.content_types.forEach((ct) => {
                    contentTypes[ct.uid] = ct;
                });
                return contentTypes
            }
        }
        catch (error) {
            console.error("ContentstackGatsby - Failed to fetch content types")
            throw error;
        }
    }

    async getContentTypes(uids) {
        // fetch and filter only content types that are not available in cache
        const uidsToFetch = uids.filter((uid) => !this.contentTypes[uid])
        if (!uidsToFetch.length) {
            return this.contentTypes;
        }
        const types = await this.fetchContentTypes(uidsToFetch)
        uidsToFetch.forEach((uid) => {
            // TODO need to set it in two places, can be better
            this.contentTypes[uid] = types[uid]
            this.contentTypesStorage.set(uid, types[uid])
        })
        return this.contentTypes;
    }

    async extractReferences(refPathMap = {}, depth = MAX_DEPTH_ALLOWED, seen = []) {
        if (depth < 0) {
            return refPathMap;
        }
        const uids = [...new Set(Object.values(refPathMap).flat())]
        const contentTypes = await this.getContentTypes(uids)
        const refPathsCount = Object.keys(refPathMap).length;
        const explorePaths = Object.entries(refPathMap).filter(([path]) => !seen.includes(path))
        for (const [refPath, refUids] of explorePaths) {
            // mark this reference path as seen
            seen.push(refPath)
            for (const uid of refUids) {
                let rPath = refPath.split(".")
                // when path is root, set path to []
                if (refPath === "") {
                    rPath = []
                }
                this.extractUids(contentTypes[uid].schema, rPath, refPathMap);
            }
        }
        if (Object.keys(refPathMap).length > refPathsCount) {
            await this.extractReferences(refPathMap, depth - 1, seen);
        }
        return refPathMap;
    }

    extractUids(schema, pathPrefix = [], refPathMap = {}) {
        const referredUids = []
        const currentPath = []
        for (const field of schema) {
            const fieldPath = [...pathPrefix, ...currentPath, field.uid]
            if (field.data_type === "reference" &&
                Array.isArray(field.reference_to) &&
                field.reference_to.length > 0
            ) {
                referredUids.push(...field.reference_to)
                refPathMap[fieldPath.join(".")] = field.reference_to
            }
            else if (field.data_type === "blocks" && field.blocks && field.blocks.length > 0) {
                for (const block of field.blocks) {
                    const { referredUids: blockRefUids } = this.extractUids(
                        block.schema,
                        [...fieldPath, block.uid], refPathMap
                    )
                    referredUids.push(...blockRefUids)
                }
            }
            else if (field.data_type === "group" && field.schema && field.schema.length > 0) {
                const { referredUids: groupRefUids } = this.extractUids(field.schema, [...fieldPath], refPathMap)
                referredUids.push(...groupRefUids)
            }
        }
        return { referredUids, refPathMap };
    }

    isNested(value) {
        if (typeof value === "object" && !Array.isArray(value) && value !== null) {
            return true;
        };
        return false;
    }

    /**
     * Identify reference paths in user-provided data
     * @param {any} data - entry data
     * @param {string[]} currentPath - traversal path 
     * @param {string[]} referenceFieldPaths - content type reference paths
     */
    identifyReferences(data, currentPath = [], referenceFieldPaths = []) {
        const paths = [];
        for (const [k, v] of Object.entries(data)) {
            // console.log(k, v, currentPath.join("."))
            if (!v) {
                continue;
            }
            if (currentPath.length > 0) {
                const refPath = currentPath.join(".")
                // if a reference path and not already collected, collect it
                if (referenceFieldPaths.includes(refPath) && !paths.includes(refPath)) {
                    paths.push(refPath)
                }
            }
            if (this.isNested(v)) {
                const tempPath = [...currentPath];
                tempPath.push(k)
                const p = this.identifyReferences(v, tempPath, referenceFieldPaths)
                paths.push(...p)
            }
            else if (Array.isArray(v)) {
                const tempPath = [...currentPath];
                tempPath.push(k)
                if (v.length > 0) {
                    // need to go over all refs since each of them could be of different
                    // content type and might contain refs
                    for (const val of v) {
                        // console.log(val, tempPath)
                        const p = this.identifyReferences(val, tempPath, referenceFieldPaths)
                        paths.push(...p)
                    }
                }
                // no multiple ref present, Gatsby value -> [] (empty array)
                // no single ref present, Gatsby value -> []
                else if (v.length === 0 && referenceFieldPaths.includes(tempPath.join("."))) {
                    // it is a single or multiple ref
                    // also no idea what child references the user must be querying
                    // so need to get all child refs
                    paths.push(tempPath.join("."))
                    const childRefPaths = referenceFieldPaths.filter((path) => path.startsWith(tempPath))
                    paths.push(...childRefPaths)
                }
            }
        }
        return [...new Set(paths)];
    }

    async get(data) {
        const receivedData = structuredClone(data)

        const { live_preview } = this.stackSdk

        if (live_preview?.hash && live_preview.hash !== "init") {

            const contentTypeUid = live_preview?.content_type_uid;
            const entryUid = live_preview?.entry_uid;

            if (isEmpty(this.referenceFields[contentTypeUid])) {
                this.referenceFields[contentTypeUid] = await this.extractReferences({ "": [contentTypeUid] });
                this.referenceFieldsStorage.set(contentTypeUid, this.referenceFields[contentTypeUid])
            }

            if (isEmpty(this.referenceFieldPaths)) {
                let referencePaths = Object.keys(this.referenceFields[contentTypeUid])
                // omit the first path (root - ""), the one provided to extractReferences
                this.referenceFieldPaths = referencePaths.slice(1, referencePaths.length)
            }

            const paths = this.identifyReferences(receivedData, [], this.referenceFieldPaths)
            // console.log("includeReference:", paths)

            const entry = await this.stackSdk.ContentType(contentTypeUid)
                .Entry(entryUid)
                .includeReference(paths)
                .toJSON().fetch()
            if (!isEmpty(entry)) {
                return entry;
            }
        }
        return receivedData;
    }

}