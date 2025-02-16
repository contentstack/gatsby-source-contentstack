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

let syncToken = [];

exports.setGlobalConfig = (config) => {
  globalConfig = { ...config }; // Creates a new copy to avoid unintended mutations
};
/*
 * Handles errors occurring during the fetch operation.
 * @param {Object} reporter - The reporting utility.
 * @param {Error} error - The caught error.
 */
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

exports.fetchData = async (configOptions, reporter, cache, contentTypeOption) => {
  activity = reporter.activityTimer("Fetching Contentstack data");
  activity.start();
  activity.setStatus("Starting to fetch data from Contentstack");

  try {
    const entryService = new OPTIONS_ENTRIES_CLASS_MAPPING[contentTypeOption]();
    const _syncData = await entryService.fetchSyncData(configOptions, cache, fetchSyncData);
    const syncData = { data: _syncData.data };

    activity.end();
    return { contentstackData: syncData.data }
  } catch (error) {
    handleFetchError(reporter, error);
  }
};


exports.fetchContentTypes = async (config, contentTypeOption) => {
  try {
    exports.setGlobalConfig(config); // Update safely

    config.cdn = config.cdn || 'https://cdn.contentstack.io/v3';

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
    handleFetchError(error);
  }
};


const fetchSyncData = async (query, config) => {
  const endpoint = 'stacks/sync';
  const response = await getSyncData(endpoint, config, query, 'items');
  return response;
};

function waitFor(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
const getData = async (url, options) => {
  const maxRetries = globalConfig.httpRetries || 3;
  let retries = 0;

  while (retries <= maxRetries) {
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      if (data.error_code) {
        if (data.error_code >= 500) {
          throw new Error(`Server error: ${data.error_code}`);
        }
        return Promise.reject(data);
      }

      if (data.items) {
        data.items = data.items.filter(item => item.data?.hasOwnProperty("publish_details"));
      }

      return data;

    } catch (error) {
      retries++;

      if (retries > maxRetries) {
        console.error("Fetch failed after retries:", error);
        return Promise.reject(new Error(`Fetch failed after ${maxRetries} retry attempts.`));
      }

      const waitTime = 2 ** retries * 100;
      console.warn(`Retrying request (${retries}/${maxRetries}) after ${waitTime}ms...`);
      await waitFor(waitTime);
    }
  }
};

/**
 * Builds the API URL with query parameters.
 */
const buildApiUrl = (url, config, query = {}) => {
  query.include_count = true;
  query.environment = config.environment;
  const queryParams = queryString.stringify(query);
  return `${config.cdn}/${url}?${queryParams}`;
};

/**
 * Constructs request headers.
 */
const buildHeaders = (config) => {
  return {
    'X-User-Agent': `contentstack-gatsby-source-plugin-${version}`,
    api_key: config?.api_key,
    access_token: config?.delivery_token,
    branch: config?.branch ?? 'main', // Uses '??' to ensure 'main' is default
    ...getCustomHeaders(config?.enableEarlyAccessKey, config?.enableEarlyAccessValue),
  };
};

const fetchCsData = async (url, config, query) => {
  if (query?.sync_token) {
  }
  const apiUrl = buildApiUrl(url, config, query);
  const options = {
    headers: buildHeaders(config),
  };
  const data = await getData(apiUrl, options);
  return data;
};

/**
 * Normalizes the limit value, ensuring it does not exceed 100.
 */
const normalizeLimit = (limit) => {
  if (limit > 100) {
    console.error('Limit cannot exceed 100. Setting limit to 50.');
    return 50;
  }
  return limit;
};

/**
 * Determines if another page needs to be fetched.
 */
const shouldFetchNextPage = (skip, limit, totalCount) => {
  return skip + limit <= totalCount;
};

/**
 * Handles fetching the next page recursively.
 */
const getNextPage = (url, config, responseKey, query, skip, limit, aggregatedResponse) => {
  return getPagedData(url, config, responseKey, query, skip + limit, limit, aggregatedResponse);
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
  query.limit = normalizeLimit(limit);
  query.include_global_field_schema = true;

  const response = await fetchCsData(url, config, query);

  // Aggregate response data
  aggregatedResponse = aggregatedResponse
    ? aggregatedResponse.concat(response[responseKey])
    : response[responseKey];

  // Check if more data needs to be fetched
  return shouldFetchNextPage(skip, limit, response.count)
    ? getNextPage(url, config, responseKey, query, skip, limit, aggregatedResponse)
    : aggregatedResponse;
};


/**
 * Tracks sync tokens if response contains 'entry_published' or 'asset_published'.
 */
const trackSyncTokens = (response) => {
  if (response.items.some(item => ['entry_published', 'asset_published'].includes(item.type))) {
    syncToken.push(response.sync_token);
  }
};

/**
 * Aggregates response data for sync.
 */
const processSyncResponse = (response, aggregatedResponse, responseKey) => {
  if (!aggregatedResponse) {
    return {
      data: response[responseKey] || [],
      sync_token: response.sync_token,
    };
  }

  return {
    data: [...(aggregatedResponse.data || []), ...response[responseKey]],
    sync_token: response.sync_token || aggregatedResponse.sync_token,
  };
};



/**
 * Handles fetching data for pagination tokens with retry logic.
 */
const handlePaginationToken = async (url, config, response, responseKey, aggregatedResponse, retries) => {
  try {
    return await getSyncData(
      url,
      config,
      { pagination_token: response.pagination_token },
      responseKey,
      aggregatedResponse,
      0 // Reset retries for pagination
    );
  } catch (error) {
    if (retries < config.httpRetries) {
      const timeToWait = 2 ** retries * 100;
      await waitFor(timeToWait);
      return await getSyncData(
        url,
        config,
        { pagination_token: response.pagination_token },
        responseKey,
        aggregatedResponse,
        retries + 1
      );
    } else {
      throw new Error(`Failed to fetch sync data after ${config.httpRetries} retry attempts due to invalid pagination token.`);
    }
  }
};

/**
 * Handles fetching additional sync tokens with retry logic.
 */
const handleSyncTokens = async (url, config, aggregatedResponse) => {
  let validTokens = syncToken.filter(item => item !== undefined);

  for (const token of validTokens) {
    let syncResponse;
    let syncRetryCount = 0;
    let lastError = null; // Track last error

    try {
      syncResponse = await fetchCsData(url, config, { sync_token: token });

    } catch (error) {
      while (syncRetryCount < config.httpRetries) {
        syncRetryCount++;
        const waitTime = 2 ** syncRetryCount * 100;

        console.warn(`${error.error_message}.! Retrying...`);

        await waitFor(waitTime);

        try {
          syncResponse = await fetchCsData(url, config, { sync_token: token });
          break; 
        } catch (retryError) {
          lastError = retryError; 
        }
      }

      // 🚨 Final Failure Handling
      if (syncRetryCount === config.httpRetries) {
        console.error(`Retries Exhausted... Exiting Gracefully...`);
        throw new Error(`${JSON.stringify(lastError || error, null, 2)}`);
      }
    }

    // ✅ Process response if successful
    if (syncResponse) {
      aggregatedResponse.data = [...(aggregatedResponse.data || []), ...syncResponse.items];
      aggregatedResponse.sync_token = syncResponse.sync_token;
    }
  }

  return aggregatedResponse;
};







const getSyncData = async (
  url,
  config,
  query,
  responseKey,
  aggregatedResponse = null,
  retries = 0
) => {
  try {
    const response = await fetchCsData(url, config, query);

    // Track sync tokens for 'entry_published' & 'asset_published'
    trackSyncTokens(response);

    // Aggregate response data
    aggregatedResponse = processSyncResponse(response, aggregatedResponse, responseKey);

    // Handle pagination token
    if (response.pagination_token) {
      return await handlePaginationToken(url, config, response, responseKey, aggregatedResponse, retries);
    }

    // Handle sync tokens
    if (response.sync_token) {
      return await handleSyncTokens(url, config, aggregatedResponse);
    }

    syncToken = []; // Reset syncToken after processing
    return aggregatedResponse;
  } catch (error) {
    throw new Error(`Failed to fetch sync data:\n ${error}`);
  }
};







