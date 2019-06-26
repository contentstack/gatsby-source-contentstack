const queryString = require("query-string");
const fetch = require("node-fetch");
const { reduce } = require("asyncro");

module.exports = async configOptions => {
  console.time(`Fetch Contentstack data`);
  console.log(`Starting to fetch data from Contentstack`);

  configOptions.cdn = configOptions.cdn
    ? configOptions.cdn
    : `https://cdn.contentstack.io/v3`;

  const contentTypes = await fetchContentTypes(configOptions);
  console.log(`Content Types loaded`);
  const locales = await fetchLocales(configOptions);
  console.log(`Locales loaded`);
  const entries = await fetchEntries(locales, contentTypes, configOptions);
  console.log(`Content Entries loaded`);

  const contentstackData = {
    locales: locales,
    contentTypes: contentTypes,
    entries: entries
  };

  return {
    contentstackData
  };

  console.timeEnd(`Fetch Contentstack data`);
};

const fetchLocales = async config => {
  let url = `locales`;
  let responseKey = `locales`;
  let allLocales = await getPagedData({ url, config, responseKey });
  return allLocales;
};

const fetchContentTypes = async config => {
  let url = `content_types`;
  let responseKey = `content_types`;
  let allContentTypes = await getPagedData({ url, config, responseKey });
  return allContentTypes;
};

const fetchEntries = async (locales, contentTypes, configOptions) => {
  let allContentTypesEntries = [];

  allContentTypesEntries = await reduce(
    contentTypes,
    async (accumulator, contentType) => {
      let contentTypesEntries = await getContentTypeEntries(contentType.uid);
      accumulator[contentType.uid] = contentTypesEntries;
      return accumulator;
    },
    {}
  );

  return allContentTypesEntries;

  async function getContentTypeEntries(contentTypeUid) {
    let url = `content_types/${contentTypeUid}/entries`;
    let responseKey = `entries`;
    let entries = await reduce(
      locales,
      async (accumulator = [], locale) => {
        let localeEntries = await getPagedData({
          config: configOptions,
          locale: locale.code,
          query: {},
          responseKey,
          url
        });
        accumulator = !accumulator.length
          ? localeEntries
          : accumulator.concat(localeEntries);
        return accumulator;
      },
      []
    );
    return entries;
  }
};

const fetchCsData = async (url, config, query) => {
  query = query ? query : {};
  query.include_count = true;
  query.api_key = config.api_key;
  query.access_token = config.access_token;
  query.environment = config.environment;

  if (url.includes("locales")) query.v = Math.floor(Math.random() * 100);

  let queryParams = queryString.stringify(query);
  let apiUrl = `${config.cdn}/${url}?${queryParams}`;

  return new Promise((resolve, reject) => {
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        console.error(err);
        reject(err);
      });
  });
};

const getPagedData = async ({
  url,
  config,
  limit = 100,
  locale,
  query = {},
  responseKey,
  skip = 0
}) => {
  query.skip = skip;
  query.limit = limit;
  query.locale = locale;
  if (url.includes("locales")) query.v = Math.floor(Math.random() * 100);
  let response = await fetchCsData(url, config, query);

  if (!aggregatedResponse) {
    aggregatedResponse = response[responseKey];
  } else {
    aggregatedResponse = aggregatedResponse.concat(response[responseKey]);
  }
  if (skip + limit <= response.count) {
    return getPagedData({
      url,
      config,
      responseKey,
      query: {},
      skip: skip + limit,
      limit,
      aggregatedResponse,
      locale
    });
  }
  return aggregatedResponse;
};
