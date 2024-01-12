import contentstack from "contentstack";
import { jsonToHTML } from "@contentstack/utils";
import isEmpty from "lodash.isempty";
import cloneDeep from "lodash.clonedeep";
import { Storage } from "./storage-helper";

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

    this.statusStorage = new Storage(window.sessionStorage, "status")
  }

  setHost(host) {
    this.stackSdk.setHost(host);
  }

  async fetchEntry(entryUid, contentTypeUid, referencePaths = [], jsonRtePaths = []) {
    const entry = await this.stackSdk
      .ContentType(contentTypeUid)
      .Entry(entryUid)
      .includeReference(referencePaths)
      .toJSON()
      .fetch();

    if (!isEmpty(entry)) {
      if (this.config.jsonRteToHtml) {
        jsonToHTML({
          entry: entry,
          paths: jsonRtePaths,
        });
      }
      return entry;
    }
  }

  isNested(value) {
    if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      return true;
    }
    return false;
  }

  unwrapEntryData(data) {
    const values = Object.values(data);
    if (!values) {
      return data;
    }
    if (values && values.length === 1) {
      return values[0];
    }
    return values;
  }

  async get(data) {
    if (data === null) {
      console.warn("Contentstack Gatsby (Live Preview): null was passed to get()");
      return data;
    }
    if (!this.isNested(data)) {
      console.warn("Contentstack Gatsby (Live Preview): data passed to get() is invalid")
      return data;
    }
    const dataCloned = cloneDeep(data);
    console.log(dataCloned)
    delete dataCloned["$"];

    const hasCslpMetaAtRoot = dataCloned.cslp__meta;
    const multipleEntriesKey = Object.keys(dataCloned);
    const hasSingleEntry = !hasCslpMetaAtRoot && multipleEntriesKey.length === 1;
    const hasMultipleEntries = !hasCslpMetaAtRoot && multipleEntriesKey.length > 1;

    const receivedData = hasSingleEntry || hasMultipleEntries ?
      this.unwrapEntryData(dataCloned) :
      dataCloned;
    const { live_preview } = this.stackSdk;



    if (live_preview?.hash && live_preview.hash !== 'init') {
      this.livePreviewConfig = live_preview;

      const hasCslpMeta = receivedData.cslp__meta;

      // item can be null, since gatsby can return null
      const hasMultipleCslpMeta = Array.isArray(receivedData) &&
        receivedData.length > 1 &&
        receivedData.every((item) => item === null || item.cslp__meta);

      if (!hasCslpMeta && !hasMultipleCslpMeta) {
        throw new Error("Contentstack Gatsby (Live Preview): Entry data must contain cslp__meta for live preview")
      }

      if (hasMultipleCslpMeta) {
        try {
          const multipleLPEntries = await Promise.all(receivedData.map((item) => {
            if (item === null) {
              return Promise.resolve(null)
            }
            return this.fetchEntry(
              item.cslp__meta.entryUid,
              item.cslp__meta.contentTypeUid,
              item.cslp__meta.refPaths,
              item.cslp__meta.rtePaths
            )
          }))
          const result = {}
          multipleEntriesKey.forEach((key, index) => {
            result[key] = multipleLPEntries[index];
          });
          return result;
        }
        catch (error) {
          console.error("Contentstack Gatsby (Live Preview):", error);
          return dataCloned;
        }
      }

      const entryCslpMeta = receivedData.cslp__meta;
      const contentTypeUid = entryCslpMeta.contentTypeUid;
      const entryUid = entryCslpMeta.entryUid;

      if (!entryUid || !contentTypeUid) {
        console.warn("Contentstack Gatsby (Live Preview): no entry uid or content type uid was found inside cslp__meta")
        return dataCloned;
      }

      const refPaths = entryCslpMeta.referencePaths ?? [];
      const rtePaths = entryCslpMeta.jsonRtePaths ?? [];
      const entry = await this.fetchEntry(entryUid, contentTypeUid, refPaths, rtePaths);
      return entry;
    }
    return dataCloned;
  }
}
