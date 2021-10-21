'use strict';

class FetchContentTypes {
  async getPagedData() { }
}

class FetchDefaultContentTypes extends FetchContentTypes {
  async getPagedData(url, config, responseKey, fn) {
    const query = {
      include_global_field_schema: true
    };
    const result = await fn.apply(null, [url, config, responseKey, query]);
    return result;
  }
}

class FetchSpecifiedContentTypes extends FetchContentTypes {
  async getPagedData(url, config, responseKey, fn) {
    const query = {
      query: JSON.stringify({
        uid: { $in: config.contentTypes }
      }),
      include_global_field_schema: true
    };
    const result = await fn.apply(null, [url, config, responseKey, query]);
    return result;
  }
}

class FetchUnspecifiedContentTypes extends FetchContentTypes {
  async getPagedData(url, config, responseKey, fn) {
    const query = {
      query: JSON.stringify({
        uid: { $nin: config.excludeContentTypes }
      }),
      include_global_field_schema: true
    };
    const result = await fn.apply(null, [url, config, responseKey, query]);
    return result;
  }
}

exports.FetchContentTypes = FetchContentTypes;
exports.FetchDefaultContentTypes = FetchDefaultContentTypes;
exports.FetchSpecifiedContentTypes = FetchSpecifiedContentTypes;
exports.FetchUnspecifiedContentTypes = FetchUnspecifiedContentTypes;