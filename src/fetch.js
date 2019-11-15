const queryString = require("query-string");
const fetch = require("node-fetch");
const { version } = require('./package.json');


module.exports = async (configOptions, reporter) => {
	console.time(`Fetch Contentstack data`);
	console.log(`Starting to fetch data from Contentstack`);

	configOptions.cdn = configOptions.cdn ? configOptions.cdn : `https://cdn.contentstack.io/v3`;
	
	const syncParams = configOptions.syncToken ? {sync_token: configOptions.syncToken} : {init: true};
	
	let contentTypes 
	let syncData
	try {
		contentTypes = await fetchContentTypes(configOptions);
	} catch (error) {
		reporter.panic(`Fetching contentstack data failed`, error);
	}
	
	try {
		syncData = await fetchSyncData(syncParams, configOptions);
	} catch (error) {
		reporter.panic(`Fetching contentstack data failed`, error);
	}


	const contentstackData = {
		contentTypes: contentTypes,
		syncData: syncData.data,
		sync_token: syncData.sync_token
	};
	
	console.timeEnd(`Fetch Contentstack data`);

	return {
		contentstackData
	};

}


const fetchContentTypes = async (config) => {
	let url = `content_types`;
	let responseKey = `content_types`;
	let query = {"include_global_field_schema":true};
    let allContentTypes = await getPagedData(url, config, responseKey, query);
	return allContentTypes;
}

const fetchSyncData = async (query, config) => {
	let url = `stacks/sync`;
	let response = await getSyncData(url, config, query, 'items'); 
	return response;	
}

const fetchCsData = async (url, config, query) => {
	query = query ? query : {};
    query.include_count = true;
    query.api_key = config.api_key;
    query.access_token = config.delivery_token;
    query.environment = config.environment;
    let queryParams = queryString.stringify(query);
	let apiUrl = `${config.cdn}/${url}?${queryParams}`;
	let option = {
		headers: {
			'X-User-Agent': `contentstack-gatsby-source-pilugin-${version}`
		}
	};
	return new Promise((resolve, reject) => {
                fetch(apiUrl,option)
                    .then(response => response.json())
                    .then(data => {
						if(data.error_code){
							console.error(data);
							reject(data);
						} else{
							resolve(data);
						}
                    })
                    .catch(err => {
						console.error(err);
						reject(err);
                    })
    		});
}

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
		let response = await fetchCsData(url, config, query); 
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
	}

const getSyncData = async (
	  url,	
	  config,
	  query,
	  responseKey,
	  aggregatedResponse = null
	) => {
		let response = await fetchCsData(url, config, query); 
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
			  query = {pagination_token:response.pagination_token},
			  responseKey,
			  aggregatedResponse,
			);
		}
	  	return aggregatedResponse;
	}