'use strict';

class FetchContentTypes {
  async getPagedData() { }
}

class FetchDefaultContentTypes extends FetchContentTypes {
  async getPagedData(url, config, responseKey, fn, query) {
    query.query = JSON.stringify(query.query);
    const result = await fn.apply(null, [url, config, responseKey, query]);
    return result;
  }
}

class FetchSpecifiedContentTypes extends FetchContentTypes {
  async getPagedData(url, config, responseKey, fn, query) {
    query.query.uid = { $in: config.contentTypes };
    const contentTypes = await fn.apply(null, [url, config, responseKey, { ...query, query: JSON.stringify(query.query) }]);

    const referredContentTypes = new ReferredContentTypes();
    const referredContentTypesList = referredContentTypes.getReferredContentTypes(contentTypes); 

    let referredContentTypesData = [];
    if (referredContentTypesList.length) {
      query.query.uid = { $in: referredContentTypesList };
      referredContentTypesData = await fn.apply(null, [url, config, responseKey, { ...query, query: JSON.stringify(query.query) }]);
    }

    const result = contentTypes.concat(referredContentTypesData);
    return result;
  }
}

class FetchUnspecifiedContentTypes extends FetchContentTypes {
  async getPagedData(url, config, responseKey, fn, query) {
    query.query.uid = { $nin: config.excludeContentTypes };
    const contentTypes = await fn.apply(null, [url, config, responseKey, { ...query, query: JSON.stringify(query.query) }]);

    const referredContentTypes = new ReferredContentTypes();
    const referredContentTypesList = referredContentTypes.getReferredContentTypes(contentTypes); 

    let referredContentTypesData = [];
    if (referredContentTypesList.length) {
      query.query.uid = { $in: referredContentTypesList };
      referredContentTypesData = await fn.apply(null, [url, config, responseKey, { ...query, query: JSON.stringify(query.query) }]);
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