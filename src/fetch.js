const queryString = require('query-string');
const fetch = require('node-fetch');
const {
  version,
// eslint-disable-next-line import/no-unresolved
} = require('./package.json');


exports.fetchData = async (configOptions, reporter) => {
  console.time('Fetch Contentstack data');
  console.log('Starting to fetch data from Contentstack');

  let syncData = {};

  if (configOptions.expediteBuild) {
    const syncEntryParams = configOptions.syncToken ? {
      sync_token: configOptions.syncToken,
    } : {
      init: true,
    };

    const syncAssetParams = configOptions.syncToken ? {
      sync_token: configOptions.syncToken,
    } : {
      init: true,
    };

    syncEntryParams.type = 'entry_published';
    syncAssetParams.type = 'asset_published';

    try {
      const [syncEntryData, syncAssetData] = await Promise.all([fetchSyncData(syncEntryParams, configOptions), fetchSyncData(syncAssetParams, configOptions)]);
      const data = syncEntryData.data.concat(syncAssetData.data);
      syncData.data = data;
      syncData.token = null;
    } catch (error) {
      reporter.panic('Fetching contentstack data failed', error);
    }
  } else {
    const syncParams = configOptions.syncToken ? {
      sync_token: configOptions.syncToken,
    } : {
      init: true,
    };

    try {
      syncData = await fetchSyncData(syncParams, configOptions);
    } catch (error) {
      reporter.panic('Fetching contentstack data failed', error);
    }
  }

  const contentstackData = {
    syncData: syncData.data,
    sync_token: syncData.sync_token,
  };

  console.timeEnd('Fetch Contentstack data');

  return {
    contentstackData,
  };
};


exports.fetchContentTypes = async (config) => {
  config.cdn = config.cdn ? config.cdn : 'https://cdn.contentstack.io/v3';

  const url = 'content_types';
  const responseKey = 'content_types';
  const query = {
    include_global_field_schema: true,
  };
  const allContentTypes = await getPagedData(url, config, responseKey, query);
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
  query.api_key = config.api_key;
  query.access_token = config.delivery_token;
  query.environment = config.environment;
  const queryParams = queryString.stringify(query);
  const apiUrl = `${config.cdn}/${url}?${queryParams}`;
  const option = {
    headers: {
      'X-User-Agent': `contentstack-gatsby-source-pilugin-${version}`,
    },
  };
  return new Promise((resolve, reject) => {
    fetch(apiUrl, option)
      .then((response) => response.json())
      .then((data) => {
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

const getPagedData = async (
  url,
  config,
  responseKey,
  query = {},
  skip = 0,
  limit = 100,
  aggregatedResponse = null,
) => {
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
    return getPagedData(
      url,
      config,
      responseKey,
      query = {},
      skip + limit,
      limit,
      aggregatedResponse,
    );
  }
  return aggregatedResponse;
};

const getSyncData = async (
  url,
  config,
  query,
  responseKey,
  aggregatedResponse = null,
) => {
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
    return getSyncData(
      url,
      config,
      query = {
        pagination_token: response.pagination_token,
      },
      responseKey,
      aggregatedResponse,
    );
  }
  return aggregatedResponse;
};
