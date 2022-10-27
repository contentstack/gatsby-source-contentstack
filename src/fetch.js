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
const { CODES } = require('./utils');

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
let logger;

exports.fetchData = async (
  configOptions,
  reporter,
  cache,
  contentTypeOption
) => {
  logger = reporter;
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
    reporter.panic({
      id: CODES.SyncError,
      context: {
        sourceMessage: `Fetching contentstack data failed. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help.`,
      },
      error,
    });
  }
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
      access_token: config.delivery_token,
    },
  };
  return new Promise((resolve, reject) => {
    fetch(apiUrl, option)
      .then(response => response.json())
      .then(data => {
        if (data.error_code) {
          console.error(data);
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
      .catch(err => {
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
  aggregatedResponse = null
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
      (query = {}),
      skip + limit,
      limit,
      aggregatedResponse
    );
  }
  return aggregatedResponse;
};

const getSyncData = async (
  url,
  config,
  query,
  responseKey,
  aggregatedResponse = null
) => {
  const response = await fetchCsData(url, config, query);
  if (!aggregatedResponse) {
    aggregatedResponse = {};
    aggregatedResponse.data = [];
    aggregatedResponse.data = response[responseKey];
    aggregatedResponse.sync_token = response.sync_token;
  } else {
    aggregatedResponse.data = aggregatedResponse.data || [];
    aggregatedResponse.data = aggregatedResponse.data.concat(
      response[responseKey]
    );
    aggregatedResponse.sync_token = response.sync_token
      ? response.sync_token
      : aggregatedResponse.sync_token;
  }
  if (response.pagination_token) {
    return getSyncData(
      url,
      config,
      (query = { pagination_token: response.pagination_token }),
      responseKey,
      aggregatedResponse
    );
  }
  return aggregatedResponse;
};
