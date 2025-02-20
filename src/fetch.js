'use strict';

/*
  `node-fetch` have different export depending on CJS or ESM
  context - requiring CJS (regular build) will return a function directly,
  requiring ESM (what is currently being bundled for rendering engines
  which are used by DSG) will return object with `default` field which is
  a function. `preferDefault` helper will just use `.default` if available,
  but will fallback to entire export if not available
*/
const preferDefault = m => (m && m.default) || m;

/**NPM dependencies */
const queryString = require('query-string');
const fetch = preferDefault(require('node-fetch'));

// eslint-disable-next-line import/no-unresolved
const { version } = require('./package.json');
const {
  FetchDefaultContentTypes,
  FetchSpecifiedContentTypes,
  FetchUnspecifiedContentTypes,
} = require('./contenttype-data');
const {
  FetchDefaultEntries,
  FetchSpecifiedContentTypesEntries,
  FetchSpecifiedLocalesEntries,
  FetchSpecifiedLocalesAndContentTypesEntries,
} = require('./entry-data');
const { CODES, getCustomHeaders } = require('./utils');

const OPTION_CLASS_MAPPING = {
  '': FetchDefaultContentTypes,
  contentTypes: FetchSpecifiedContentTypes,
  excludeContentTypes: FetchUnspecifiedContentTypes,
  locales: FetchDefaultContentTypes,
  contentTypeslocales: FetchSpecifiedContentTypes,
  excludeContentTypeslocales: FetchUnspecifiedContentTypes,
};

const OPTIONS_ENTRIES_CLASS_MAPPING = {
  '': FetchDefaultEntries,
  contentTypes: FetchSpecifiedContentTypesEntries,
  excludeContentTypes: FetchSpecifiedContentTypesEntries,
  locales: FetchSpecifiedLocalesEntries,
  contentTypeslocales: FetchSpecifiedLocalesAndContentTypesEntries,
  excludeContentTypeslocales: FetchSpecifiedLocalesAndContentTypesEntries,
};

let activity;
let globalConfig;

let syncTokens = [];

function handleFetchError(reporter, error) {
  reporter.panic({
    id: CODES.SyncError,
    context: {
      sourceMessage:
        "Fetching Contentstack data failed. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help.",
    },
    error,
  });
}

exports.fetchData = async (
  configOptions,
  reporter,
  cache,
  contentTypeOption
) => {
  activity = reporter.activityTimer(`Fetching Contentstack data`);
  activity.start();
  activity.setStatus('Starting to fetch data from Contentstack');

  try {
    let syncData = {};
    const entryService = new OPTIONS_ENTRIES_CLASS_MAPPING[contentTypeOption]();
    const _syncData = await entryService.fetchSyncData(
      configOptions,
      cache,
      fetchSyncData
    );
    syncData.data = _syncData.data;
    const contentstackData = { syncData: syncData.data };

    activity.end();

    return { contentstackData };
  } catch (error) {
    reporter.panic({
      id: CODES.SyncError,
      context: {
        sourceMessage: `Fetching contentstack data failed. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help.`,
      },
      error,
    });
  }
};

exports.fetchContentTypes = async (config, contentTypeOption) => {
  globalConfig = config;
  try {
    config.cdn = config.cdn ? config.cdn : 'https://cdn.contentstack.io/v3';

    const url = 'content_types';
    const responseKey = 'content_types';
    const contentType = new OPTION_CLASS_MAPPING[contentTypeOption]();
    const allContentTypes = await contentType.getPagedData(
      url,
      config,
      responseKey,
      getPagedData
    );
    return allContentTypes;
  } catch (error) {
    handleFetchError(reporter, error);
  }
};

const fetchSyncData = async (query, config) => {
  const url = 'stacks/sync';
  const response = await getSyncData(url, config, query, 'items');
  return response;
};

function waitFor(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

const getData = async (url, options) => {
  let retries = 0;
  return new Promise((resolve, reject) => {
    const handleResponse = () => {
      fetch(url, options)
        .then(response => response.json())
        .then(data => {
          if (data.error_code) {
            console.error(data);
            if (data.error_code >= 500) {
              throw new Error(`Server error: ${data.error_code}`);
            }
            reject(data);
          } else {
            if (data.items) {
              const filteredData = data?.items.filter(item => {
                return item.data.hasOwnProperty('publish_details');
              });
              data.items = filteredData;
            }
            resolve(data);
          }
        })
        .catch(async err => {
          const retryAttempt = globalConfig.httpRetries
            ? globalConfig.httpRetries
            : 3;
          if (retries < retryAttempt) {
            retries++;
            const timeToWait = 2 ** retries * 100;
            await waitFor(timeToWait);
            handleResponse();
          } else {
            console.error(err);
            reject(
              new Error(`Fetch failed after ${retryAttempt} retry attempts.`)
            );
          }
        });
    };
    retries = 1;
    handleResponse();
  });
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
      api_key: config?.api_key,
      access_token: config?.delivery_token,
      branch: config?.branch ? config.branch : 'main',
      ...getCustomHeaders(
        config?.enableEarlyAccessKey,
        config?.enableEarlyAccessValue
      ),
    },
  };
  const data = await getData(apiUrl, option);
  return data;
};

const getPagedData = async (
  url,
  config,
  responseKey,
  query = {},
  skip = 0,
  limit = config?.limit,
  aggregatedResponse = null
) => {
  query.skip = skip;
  //if limit is greater than 100, it will throw ann error that limit cannot exceed 100.
  if (limit > 100) {
    console.error('Limit cannot exceed 100. Setting limit to 50.');
  }
  query.limit = limit > 100 ? 50 : limit;
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
      (query = {}),
      skip + limit,
      limit,
      aggregatedResponse
    );
  }
  return aggregatedResponse;
};

const getSyncData = async (url, config, query, responseKey, aggregatedResponse = null, retries = 0) => {
  try {
    const response = await fetchCsData(url, config, query);
    const syncEvents = ['entry_published', 'asset_published'];

    // Collect sync tokens from response items
    if (response.items.some(item => syncEvents.includes(item.type))) {
      syncTokens.push(response.sync_token);
    }

    // Initialize aggregated response if not provided
    if (!aggregatedResponse) {
      aggregatedResponse = {
        data: response[responseKey] || [],
        sync_token: response.sync_token,
      };
    } else {
      aggregatedResponse.data = [...(aggregatedResponse.data || []), ...response[responseKey]];
      aggregatedResponse.sync_token = response.sync_token || aggregatedResponse.sync_token;
    }

    // Handle pagination
    if (response.pagination_token) {
      return handlePagination(url, config, response.pagination_token, responseKey, aggregatedResponse);
    }

    // Handle sync tokens for final sync call
    if (response.sync_token) {
      await processSyncTokens(url, config, syncTokens, aggregatedResponse);
    }

    syncTokens = [];
    return aggregatedResponse;
  } catch (error) {
    throw new Error(`Failed to fetch sync data: ${error.message}`);
  }
};

const handlePagination = async (url, config, paginationToken, responseKey, aggregatedResponse, retries = 0) => {
  let lastError = null;
  try {
    return await getSyncData(url, config, { pagination_token: paginationToken }, responseKey, aggregatedResponse, 0);
  } catch (error) {
    lastError = error;
    if (retries < config.httpRetries) {
      const retryDelay = 2 ** retries * 100;
      await waitFor(retryDelay);
      return await handlePagination(url, config, paginationToken, responseKey, aggregatedResponse, retries + 1);
    }
    throw new Error(`Failed to fetch sync data after ${config.httpRetries} retries due to pagination error. \nLast error details:${JSON.stringify(lastError, null, 2)}`);
  }
};

const processSyncTokens = async (url, config, syncTokens, aggregatedResponse) => {
  const validTokens = syncTokens.filter(Boolean);

  for (const token of validTokens) {
    let retries = 0;
    let lastError = null;

    while (retries <= config.httpRetries) {
      try {
        let syncResponse;
        syncResponse = await fetchCsData(url, config, { sync_token: token });
        aggregatedResponse.data = [...(aggregatedResponse.data || []), ...syncResponse.items];
        aggregatedResponse.sync_token = syncResponse.sync_token;
        break;
      } catch (error) {
        retries++;
        lastError = error;
        if (retries > config.httpRetries) {
          throw new Error(
            `Failed to fetch sync data after ${config.httpRetries} retries due to sync token error.\nLast error details: ${JSON.stringify(lastError, null, 2)}`
          );
        }
        const retryDelay = 2 ** retries * 100;
        await waitFor(retryDelay);
        console.warn(`✅----- Retrying request (${retries}/${config.httpRetries})...`);
      }
    }
  }
};

