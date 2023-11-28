import contentstack from 'contentstack';
import { jsonToHTML } from '@contentstack/utils';
import isEmpty from 'lodash.isempty';
import { Storage } from './storage-helper';

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
    this.livePreviewConfig = {
      hash: "",
      content_type_uid: "",
      entry_uid: ""
    }

    this.config.maxDepth = config.maxDepth && config.maxDepth <= MAX_DEPTH_ALLOWED ? config.maxDepth : MAX_DEPTH_ALLOWED
    
    const stackConfig = {
      api_key: config.api_key,
      delivery_token: config.delivery_token,
      environment: config.environment,
      ...(config.region && { region: config.region }),
      ...(config.branch && { branch: config.branch }),
      live_preview: {
        host: config.live_preview.host,
        management_token: config.live_preview.management_token,
        enable: config.live_preview.enable,
      },
    }
    this.stackSdk = contentstack.Stack(stackConfig);

    // reference fields in various CTs and the CTs they refer
    this.referenceFieldsStorage = new Storage(
      window.sessionStorage,
      'reference_fields'
    );
    this.referenceFields = this.referenceFieldsStorage.get();

    this.statusStorage = new Storage(window.sessionStorage, "status")

    // json rte fields in various CTs
    this.jsonRteFieldsStorage = new Storage(
      window.sessionStorage,
      'json_rte_fields'
    );
    this.jsonRteFields = this.jsonRteFieldsStorage.get();

    // only field paths extracted from the above map for current CT
    this.referenceFieldPaths = [];

    // store content types in LP site's session storage
    this.contentTypesStorage = new Storage(
      window.sessionStorage,
      'content_types'
    );
    this.contentTypes = this.contentTypesStorage.get();
  }

  setHost(host) {
    this.stackSdk.setHost(host);
  }

  static addContentTypeUidFromTypename(entry) {
    if (typeof entry === "undefined") {
      throw new TypeError("entry cannot be empty");
    }
    if (entry === null) {
      throw new TypeError("entry cannot be null")
    }
    if (typeof entry !== "object") {
      throw new TypeError("entry must be an object")
    }
    if (Array.isArray(entry)) {
      throw new TypeError("entry cannot be an object, pass an instance of entry")
    }

    traverse(entry)

    function traverse(field) {
      if (!field || typeof field !== "object") {
        return;
      }
      if (Array.isArray(field)) {
        field.forEach((instance) => traverse(instance))
      }
      if (Object.hasOwnProperty.call(field, "__typename") && typeof field.__typename == "string") {
        field._content_type_uid = field.__typename.split("_").slice(1).join("_");
      }
      Object.values(field).forEach((subField) => traverse(subField))
    }
  }

  async fetchContentTypes(uids) {
    try {
      const result = await this.stackSdk.getContentTypes({
        query: { uid: { $in: uids } },
        include_global_field_schema: true,
      });
      if (result) {
        const contentTypes = {};
        result.content_types.forEach(ct => {
          contentTypes[ct.uid] = ct;
        });
        return contentTypes;
      }
    } catch (error) {
      console.error('ContentstackGatsby - Failed to fetch content types');
      throw error;
    }
  }

  async getContentTypes(uids) {
    // fetch and filter only content types that are not available in cache
    const uidsToFetch = uids.filter(uid => !this.contentTypes[uid]);
    if (!uidsToFetch.length) {
      return this.contentTypes;
    }
    const types = await this.fetchContentTypes(uidsToFetch);
    uidsToFetch.forEach(uid => {
      // TODO need to set it in two places, can be better
      this.contentTypes[uid] = types[uid];
      this.contentTypesStorage.set(uid, types[uid]);
    });
    return this.contentTypes;
  }

  async extractReferences(
    refPathMap = {},
    status,
    jsonRtePaths = [],
    depth = this.config.maxDepth,
    seen = []
  ) {
    if (depth <= 0) {
      return refPathMap;
    }
    const uids = [...new Set(Object.values(refPathMap).flat())];
    const contentTypes = await this.getContentTypes(uids);
    const refPathsCount = Object.keys(refPathMap).length;
    const explorePaths = Object.entries(refPathMap).filter(
      ([path]) => !seen.includes(path)
    );
    for (const [refPath, refUids] of explorePaths) {
      // mark this reference path as seen
      seen.push(refPath);
      for (const uid of refUids) {
        let rPath = refPath.split('.');
        // when path is root, set path to []
        if (refPath === '') {
          rPath = [];
        }

        if (!status.hasLivePreviewEntryFound) {
          status.hasLivePreviewEntryFound = this.isCurrentEntryEdited(uid)
        }

        this.extractUids(
          contentTypes[uid].schema,
          rPath,
          refPathMap,
          jsonRtePaths
        );
      }
    }
    if (Object.keys(refPathMap).length > refPathsCount) {
      await this.extractReferences(refPathMap, status, jsonRtePaths, depth - 1, seen);
    }
    return { refPathMap, jsonRtePaths };
  }

  extractUids(schema, pathPrefix = [], refPathMap = {}, jsonRtePaths = []) {
    const referredUids = [];
    for (const field of schema) {
      const fieldPath = [...pathPrefix, field.uid];
      if (
        field.data_type === 'reference' &&
        Array.isArray(field.reference_to) &&
        field.reference_to.length > 0
      ) {
        referredUids.push(...field.reference_to);
        refPathMap[fieldPath.join('.')] = field.reference_to;
      } else if (
        field.data_type === 'blocks' &&
        field.blocks &&
        field.blocks.length > 0
      ) {
        for (const block of field.blocks) {
          const { referredUids: blockRefUids } = this.extractUids(
            block.schema,
            [...fieldPath, block.uid],
            refPathMap,
            jsonRtePaths
          );
          referredUids.push(...blockRefUids);
        }
      } else if (
        field.data_type === 'group' &&
        field.schema &&
        field.schema.length > 0
      ) {
        const { referredUids: groupRefUids } = this.extractUids(
          field.schema,
          [...fieldPath],
          refPathMap,
          jsonRtePaths
        );
        referredUids.push(...groupRefUids);
      } else if (
        field.data_type === 'json' &&
        field.field_metadata?.allow_json_rte
      ) {
        const rtePath = [...pathPrefix, field.uid].join('.');
        jsonRtePaths.push(rtePath);
      }
    }
    return { referredUids, refPathMap };
  }

  isNested(value) {
    if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      return true;
    }
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
      if (!v) {
        continue;
      }
      if (currentPath.length > 0) {
        const refPath = currentPath.join('.');
        // if a reference path and not already collected, collect it
        if (referenceFieldPaths.includes(refPath) && !paths.includes(refPath)) {
          paths.push(refPath);
        }
      }
      if (this.isNested(v)) {
        const tempPath = [...currentPath];
        tempPath.push(k);
        const p = this.identifyReferences(v, tempPath, referenceFieldPaths);
        paths.push(...p);
      } else if (Array.isArray(v)) {
        const tempPath = [...currentPath];
        tempPath.push(k);
        if (v.length > 0) {
          // need to go over all refs since each of them could be of different
          // content type and might contain refs
          for (const val of v) {
            const p = this.identifyReferences(
              val,
              tempPath,
              referenceFieldPaths
            );
            paths.push(...p);
          }
        }
        // no multiple ref present, Gatsby value -> [] (empty array)
        // no single ref present, Gatsby value -> []
        else if (
          v.length === 0 &&
          referenceFieldPaths.includes(tempPath.join('.'))
        ) {
          // it is a single or multiple ref
          // also no idea what child references the user must be querying
          // so need to get all child refs
          paths.push(tempPath.join('.'));
          const childRefPaths = referenceFieldPaths.filter(path =>
            path.startsWith(tempPath)
          );
          paths.push(...childRefPaths);
        }
      }
    }
    return [...new Set(paths)];
  }

  isCurrentEntryEdited(entryContentType) {
    return entryContentType === this.livePreviewConfig?.content_type_uid
  }

  async get(data) {
    const receivedData = structuredClone(data);
    const { live_preview } = this.stackSdk;

    let status = {
      hasLivePreviewEntryFound: false
    }

    if (live_preview?.hash && live_preview.hash !== 'init') {
      this.livePreviewConfig = live_preview;
      if (!receivedData.__typename) {
        throw new Error("Entry data must contain __typename for live preview")
      }
      if (!receivedData.uid) {
        throw new Error("Entry data must contain uid for live preview")
      }
      const contentTypeUid = receivedData.__typename.split("_").slice(1).join("_")
      const entryUid = receivedData.uid;

      status = this.statusStorage.get(contentTypeUid) ?? { hasLivePreviewEntryFound: this.isCurrentEntryEdited(contentTypeUid) }

      if (
        isEmpty(this.referenceFields[contentTypeUid]) ||
        isEmpty(this.jsonRteFields[contentTypeUid])
      ) {
        const { refPathMap, jsonRtePaths } = await this.extractReferences({
          '': [contentTypeUid],
        }, status);
        // store reference paths
        this.referenceFields[contentTypeUid] = refPathMap;
        this.referenceFieldsStorage.set(
          contentTypeUid,
          this.referenceFields[contentTypeUid]
        );
        // store json rte paths
        this.jsonRteFields[contentTypeUid] = jsonRtePaths;
        this.jsonRteFieldsStorage.set(
          contentTypeUid,
          this.jsonRteFields[contentTypeUid]
        );
      }

      let referencePaths = Object.keys(this.referenceFields[contentTypeUid]);
      referencePaths = referencePaths.filter(field => !!field)

      const paths = this.identifyReferences(
        receivedData,
        [],
        referencePaths
      );

      this.statusStorage.set(contentTypeUid, status)

      if (!status.hasLivePreviewEntryFound) {
        return receivedData
      }

      const entry = await this.stackSdk
        .ContentType(contentTypeUid)
        .Entry(entryUid)
        .includeReference(paths)
        .toJSON()
        .fetch();
      if (!isEmpty(entry)) {
        if (this.config.jsonRteToHtml) {
          jsonToHTML({
            entry: entry,
            paths: this.jsonRteFields[contentTypeUid] ?? [],
          });
        }
        return entry;
      }
    }
    return receivedData;
  }
}
