'use strict';

class FetchContentTypes {
  query;
  constructor(query) {
    this.query = query;
  }
  async getPagedData() { }
}

class FetchDefaultContentTypes extends FetchContentTypes {
  constructor(query) {
    this.query = query;
  }

  async getPagedData(url, config, responseKey, fn) {
    this.query.query = JSON.stringify(this.query.query);
    const result = await fn.apply(null, [url, config, responseKey, this.query]);
    return result;
  }
}

class FetchSpecifiedContentTypes extends FetchContentTypes {
  constructor(query) {
    super(query);
    // We don't want to restrict the specified content-types download by last fetch time, as it can ignore updates from referred content-types.
    delete query.query;
    this.query = query;
  }

  async getPagedData(url, config, responseKey, fn) {
    this.query.query.uid = { $in: config.contentTypes };
    this.query.query = JSON.stringify(this.query.query);
    const contentTypes = await fn.apply(null, [url, config, responseKey, this.query]);

    const referredContentTypes = new ReferredContentTypes();
    const referredContentTypesList = referredContentTypes.getReferredContentTypes(contentTypes); 

    let referredContentTypesData = [];
    if (referredContentTypesList.length) {
      this.query.query = JSON.stringify({ uid: { $in: referredContentTypesList } });
      referredContentTypesData = await fn.apply(null, [url, config, responseKey, this.query]);
    }

    const result = contentTypes.concat(referredContentTypesData);
    return result;
  }
}

class FetchUnspecifiedContentTypes extends FetchContentTypes {
  constructor(query) {
    super(query);
    // We don't want to restrict the specified content-types download by last fetch time, as it can ignore updates from referred content-types.
    delete query.query;
    this.query = query;
  }

  async getPagedData(url, config, responseKey, fn) {
    this.query.query.uid = { $nin: config.excludeContentTypes };
    this.query.query = JSON.stringify(this.query.query);
    const contentTypes = await fn.apply(null, [url, config, responseKey, this.query]);

    const referredContentTypes = new ReferredContentTypes();
    const referredContentTypesList = referredContentTypes.getReferredContentTypes(contentTypes); 

    let referredContentTypesData = [];
    if (referredContentTypesList.length) {
      this.query.query = JSON.stringify({ uid: { $in: referredContentTypesList } });
      referredContentTypesData = await fn.apply(null, [url, config, responseKey, this.query]);
    }

    const result = contentTypes.concat(referredContentTypesData);
    return result;
  }
}

class ReferredContentTypes {
  getReferredContentTypes(contentTypes) {
    let referredContentTypes = {};
    for (let i = 0; i < contentTypes.length; i++) {
      const contentType = contentTypes[i];
      for (let j = 0; j < contentType.schema.length; j++) {
        const schema = contentType.schema[j];
        if (schema.data_type === 'reference') {
          for (let k = 0; k < schema.reference_to.length; k++) {
            // Keep unique values only.
            referredContentTypes[schema.reference_to[k]] = null;
          }
        }
      }
    }
    // Remove the content-types if they were already fetched.
    for (let i = 0; i < contentTypes.length; i++) {
      const contentType = contentTypes[i].uid;
      const keys = Object.keys(referredContentTypes);
      if (keys.includes(contentType)) {
        delete referredContentTypes[contentType];
      }
    }
    return Object.keys(referredContentTypes);
  }
}

exports.FetchContentTypes = FetchContentTypes;
exports.FetchDefaultContentTypes = FetchDefaultContentTypes;
exports.FetchSpecifiedContentTypes = FetchSpecifiedContentTypes;
exports.FetchUnspecifiedContentTypes = FetchUnspecifiedContentTypes;