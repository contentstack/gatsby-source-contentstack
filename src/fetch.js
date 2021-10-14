'use strict';
/**NPM dependencies */
const queryString = require('query-string');
const fetch = require('node-fetch');

// eslint-disable-next-line import/no-unresolved
const { version } = require('./package.json');
const { CODES } = require('./utils');

class FetchContentTypes {
  async getPagedData() {}
}
class FetchDefaultContentTypes extends FetchContentTypes {
  async getPagedData(url, config, responseKey) {
    const query = {
      include_global_field_schema: true
    };
    const result = await getPagedData(url, config, responseKey, query);
    return result;
  }
}

class FetchSpecifiedContentTypes extends FetchContentTypes {
  async getPagedData(url, config, responseKey) {
    const query = {
      query: JSON.stringify({
        uid: { $in: config.includeContentTypes }
      }),
      include_global_field_schema: true
    };
    const result = await getPagedData(url, config, responseKey, query);
    return result;
  }
}

class FetchUnspecifiedContentTypes extends FetchContentTypes {
  async getPagedData(url, config, responseKey) {
    const query = {
      query: JSON.stringify({
        uid: { $nin: config.excludeContentTypes }
      }),
      include_global_field_schema: true
    };
    const result = await getPagedData(url, config, responseKey, query);
    return result;
  }
}

const OPTION_CLASS_MAPPING = {
  '': FetchDefaultContentTypes,
  includeContentTypes: FetchSpecifiedContentTypes,
  excludeContentTypes: FetchUnspecifiedContentTypes
};

class FetchEntries {
  async fetchSyncData() {}
}

class FetchDefaultEntries extends FetchEntries {
  async fetchSyncData(configOptions, reporter, cache) {
    const typePrefix = configOptions.type_prefix || 'Contentstack';
    const tokenKey = `${typePrefix.toLowerCase()}-sync-token-${configOptions.api_key}`;
    const syncToken = await cache.get(tokenKey);

    let syncData = {};
    if (configOptions.expediteBuild) {
      const syncEntryParams = syncToken ? { sync_token: syncToken } : { init: true };
      // TODO: make a copy of syncEntryParams.
      const syncAssetParams = syncToken ? { sync_token: syncToken } : { init: true };
  
      syncEntryParams.type = 'entry_published, entry_unpublished, entry_deleted';
      syncAssetParams.type = 'asset_published, asset_unpublished, asset_deleted';
  
      try {
        const [syncEntryData, syncAssetData] = await Promise.all([fetchSyncData(syncEntryParams, configOptions), fetchSyncData(syncAssetParams, configOptions)]);
        const data = syncEntryData.data.concat(syncAssetData.data);
        syncData.data = data;
        syncData.sync_token = data.sync_token;
      } catch (error) {
        reporter.panic({
          id: CODES.SyncError,
          context: {
            sourceMessage: `Fetching contentstack data failed [expediteBuild]. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help.`
          },
          error
        });
      }
    } else {
      const syncParams = syncToken ? { sync_token: syncToken } : { init: true };
  
      try {
        syncData = await fetchSyncData(syncParams, configOptions);
      } catch (error) {
        reporter.panic({
          id: CODES.SyncError,
          context: {
            sourceMessage: `Fetching contentstack data failed. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help.`
          },
          error
        });
      }
    }
    // Caching token for the next sync
    await cache.set(tokenKey, syncData.sync_token);
    return syncData;
  }
}

class FetchSpecifiedContentTypesEntries extends FetchEntries {
  async fetchSyncData(configOptions, reporter, cache) {
    const typePrefix = configOptions.type_prefix || 'Contentstack';
    const contentTypes = await cache.get(typePrefix);
    let syncData = {};

    for (let i = 0; i < contentTypes.length; i++) {
      const contentType = contentTypes[i].uid;
      const tokenKey = `${typePrefix.toLowerCase()}-sync-token-${contentType}-${configOptions.api_key}`;

      try {
        const syncToken = await cache.get(tokenKey);
        const syncParams = syncToken ? { sync_token: syncToken } : { init: true };
        !syncToken && (syncParams.content_type_uid = contentType);
        const _syncData = await fetchSyncData(syncParams, configOptions);
        syncData.data = syncData.data || [];
        syncData.data = syncData.data.concat(_syncData.data);
        // Caching token for the next sync.
        await cache.set(tokenKey, _syncData.sync_token);
      } catch (error) {
        reporter.panic({
          id: CODES.SyncError,
          context: {
            sourceMessage: `Fetching contentstack data failed. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help.`
          },
          error
        });
      }
    }

    return syncData;
  }
}

const OPTIONS_ENTRIES_CLASS_MAPPING = {
  '': FetchDefaultEntries,
  includeContentTypes: FetchSpecifiedContentTypesEntries,
  excludeContentTypes: FetchSpecifiedContentTypesEntries,
};

exports.fetchData = async (configOptions, reporter, cache, contentTypeOption) => {
  console.time('Fetch Contentstack data');
  console.log('Starting to fetch data from Contentstack');

  let syncData = {};
  const entryService = new OPTIONS_ENTRIES_CLASS_MAPPING[contentTypeOption]();
  const _syncData = await entryService.fetchSyncData(configOptions, reporter, cache);
  syncData.data = _syncData.data;
  const contentstackData = { syncData: syncData.data };

  console.timeEnd('Fetch Contentstack data');

  return { contentstackData };
};


exports.fetchContentTypes = async (config, contentTypeOption) => {
  config.cdn = config.cdn ? config.cdn : 'https://cdn.contentstack.io/v3';

  const url = 'content_types';
  const responseKey = 'content_types';
  const contentType = new OPTION_CLASS_MAPPING[contentTypeOption]();
  const allContentTypes = await contentType.getPagedData(url, config, responseKey);
  return allContentTypes;
};

const fetchSyncData = async (query, config) => {
  const url = 'stacks/sync';
  const response = await getSyncData(url, config, query, 'items');
  return response;
};

const fetchCsData = async (url, config, query) => {
  query = query || {};
  query.include_count = true;
  query.environment = config.environment;
  const queryParams = queryString.stringify(query);
  const apiUrl = `${config.cdn}/${url}?${queryParams}`;
  const option = {
    headers: {
      'X-User-Agent': `contentstack-gatsby-source-plugin-${version}`,
      api_key: config.api_key,
      access_token: config.delivery_token
    }
  };
  return new Promise((resolve, reject) => {
    fetch(apiUrl, option)
      .then(response => response.json())
      .then(data => {
        if (data.error_code) {
          console.error(data);
          reject(data);
        } else {
          resolve(data);
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};

const getPagedData = async (url, config, responseKey, query = {}, skip = 0, limit = 100, aggregatedResponse = null) => {
  query.skip = skip;
  query.limit = limit;
  query.include_global_field_schema = true;
  const response = await fetchCsData(url, config, query);
  if (!aggregatedResponse) {
    aggregatedResponse = response[responseKey];
  } else {
    aggregatedResponse = aggregatedResponse.concat(response[responseKey]);
  }
  if (skip + limit <= response.count) {
    return getPagedData(url, config, responseKey, query = {}, skip + limit, limit, aggregatedResponse);
  }
  return aggregatedResponse;
};

const getSyncData = async (url, config, query, responseKey, aggregatedResponse = null) => {
  const response = await fetchCsData(url, config, query);
  if (!aggregatedResponse) {
    aggregatedResponse = {};
    aggregatedResponse.data = [];
    aggregatedResponse.data = response[responseKey];
    aggregatedResponse.sync_token = response.sync_token;
  } else {
    aggregatedResponse.data = aggregatedResponse.data || [];
    aggregatedResponse.data = aggregatedResponse.data.concat(response[responseKey]);
    aggregatedResponse.sync_token = response.sync_token ? response.sync_token : aggregatedResponse.sync_token;
  }
  if (response.pagination_token) {
    return getSyncData(url, config, query = { pagination_token: response.pagination_token }, responseKey, aggregatedResponse);
  }
  return aggregatedResponse;
};
