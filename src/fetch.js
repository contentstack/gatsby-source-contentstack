'use strict';
/**NPM dependencies */
const queryString = require('query-string');
const fetch = require('node-fetch');

// eslint-disable-next-line import/no-unresolved
const { version } = require('./package.json');
const { FetchDefaultContentTypes, FetchSpecifiedContentTypes, FetchUnspecifiedContentTypes } = require('./contenttype-data');
const { FetchDefaultEntries, FetchSpecifiedContentTypesEntries, FetchSpecifiedLocalesEntries, FetchSpecifiedLocalesAndContentTypesEntries } = require('./entry-data');
const { CODES, LAST_CONTENT_TYPE_FETCH_TIME, DEFAULT_CONTENT_TYPE_FETCH_TIME } = require('./utils');

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

exports.fetchData = async (configOptions, reporter, cache, contentTypeOption) => {
  console.time('Fetch Contentstack data');
  console.log('Starting to fetch data from Contentstack');

  try {
    let syncData = {};
    const typePrefix = configOptions.type_prefix || 'Contentstack';
    const lastFetchTimeKey = `${typePrefix}_${configOptions.api_key}_${LAST_CONTENT_TYPE_FETCH_TIME}`;
    const contentTypeFetchTimeQuery = getLastContentTypeFetchTime(lastFetchTimeKey, cache);
    // Cache the current time from when the changes in content-types changed will be detected.
    let currentTime = new Date();
    currentTime = currentTime.toISOString();
    const query = {
      include_global_field_schema: true,
      query: { ...contentTypeFetchTimeQuery },
    };

    const entryService = new OPTIONS_ENTRIES_CLASS_MAPPING[contentTypeOption](query);
    const _syncData = await entryService.fetchSyncData(configOptions, cache, fetchSyncData);
    syncData.data = _syncData.data;
    const contentstackData = { syncData: syncData.data };
  
    console.timeEnd('Fetch Contentstack data');
    // Set last fetch time here.
    await cache.set(lastFetchTimeKey, currentTime);
  
    return { contentstackData };
  } catch (error) {
    reporter.panic({
      id: CODES.SyncError,
      context: { sourceMessage: `Fetching contentstack data failed. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help.` },
      error
    });
  }
};

const getLastContentTypeFetchTime = async (lastFetchTimeKey, cache) => {
  const lastFetch = await cache.get(lastFetchTimeKey);
  const fetchTimeQuery = {};
  if (lastFetch) {
    fetchTimeQuery.updated_at = lastFetch;
  } else {
    fetchTimeQuery.created_at = DEFAULT_CONTENT_TYPE_FETCH_TIME;
  }
  return fetchTimeQuery;
};

exports.fetchContentTypes = async (config, contentTypeOption) => {
  try {
    config.cdn = config.cdn ? config.cdn : 'https://cdn.contentstack.io/v3';

    const url = 'content_types';
    const responseKey = 'content_types';
    const contentType = new OPTION_CLASS_MAPPING[contentTypeOption]();
    const allContentTypes = await contentType.getPagedData(url, config, responseKey, getPagedData);
    return allContentTypes;
  } catch (error) {
    reporter.panic({
      id: CODES.SyncError,
      context: { sourceMessage: `Fetching contentstack data failed. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help.` },
      error
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
