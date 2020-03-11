"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var queryString = require("query-string");
var fetch = require("node-fetch");

var _require = require('./package.json'),
    version = _require.version;

module.exports = function () {
	var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(configOptions, reporter) {
		var contentTypes, syncData, syncEntryParams, syncAssetParams, _ref2, _ref3, contentTypesdata, syncEntryData, syncAssetData, data, syncParams, _ref4, _ref5, contentstackData;

		return _regenerator2.default.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						console.time("Fetch Contentstack data");
						console.log("Starting to fetch data from Contentstack");

						configOptions.cdn = configOptions.cdn ? configOptions.cdn : "https://cdn.contentstack.io/v3";

						contentTypes = void 0;
						syncData = {};

						if (!(process.env.NODE_ENV === 'production')) {
							_context.next = 29;
							break;
						}

						syncEntryParams = configOptions.syncToken ? {
							sync_token: configOptions.syncToken
						} : {
							init: true
						};
						syncAssetParams = configOptions.syncToken ? {
							sync_token: configOptions.syncToken
						} : {
							init: true
						};


						syncEntryParams['type'] = 'entry_published';
						syncAssetParams['type'] = 'asset_published';

						_context.prev = 10;
						_context.next = 13;
						return _promise2.default.all([fetchContentTypes(configOptions), fetchSyncData(syncEntryParams, configOptions), fetchSyncData(syncAssetParams, configOptions)]);

					case 13:
						_ref2 = _context.sent;
						_ref3 = (0, _slicedToArray3.default)(_ref2, 3);
						contentTypesdata = _ref3[0];
						syncEntryData = _ref3[1];
						syncAssetData = _ref3[2];

						contentTypes = contentTypesdata;
						data = syncEntryData.data.concat(syncAssetData.data);

						syncData.data = data;
						syncData.token = null;
						_context.next = 27;
						break;

					case 24:
						_context.prev = 24;
						_context.t0 = _context["catch"](10);

						reporter.panic("Fetching contentstack data failed", _context.t0);

					case 27:
						_context.next = 42;
						break;

					case 29:
						syncParams = configOptions.syncToken ? {
							sync_token: configOptions.syncToken
						} : {
							init: true
						};
						_context.prev = 30;
						_context.next = 33;
						return _promise2.default.all([fetchContentTypes(configOptions), fetchSyncData(syncParams, configOptions)]);

					case 33:
						_ref4 = _context.sent;
						_ref5 = (0, _slicedToArray3.default)(_ref4, 2);
						contentTypes = _ref5[0];
						syncData = _ref5[1];
						_context.next = 42;
						break;

					case 39:
						_context.prev = 39;
						_context.t1 = _context["catch"](30);

						reporter.panic("Fetching contentstack data failed", _context.t1);

					case 42:
						contentstackData = {
							contentTypes: contentTypes,
							syncData: syncData.data,
							sync_token: syncData.sync_token
						};


						console.timeEnd("Fetch Contentstack data");

						return _context.abrupt("return", {
							contentstackData: contentstackData
						});

					case 45:
					case "end":
						return _context.stop();
				}
			}
		}, _callee, undefined, [[10, 24], [30, 39]]);
	}));

	return function (_x, _x2) {
		return _ref.apply(this, arguments);
	};
}();

var fetchContentTypes = function () {
	var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(config) {
		var url, responseKey, query, allContentTypes;
		return _regenerator2.default.wrap(function _callee2$(_context2) {
			while (1) {
				switch (_context2.prev = _context2.next) {
					case 0:
						url = "content_types";
						responseKey = "content_types";
						query = {
							"include_global_field_schema": true
						};
						_context2.next = 5;
						return getPagedData(url, config, responseKey, query);

					case 5:
						allContentTypes = _context2.sent;
						return _context2.abrupt("return", allContentTypes);

					case 7:
					case "end":
						return _context2.stop();
				}
			}
		}, _callee2, undefined);
	}));

	return function fetchContentTypes(_x3) {
		return _ref6.apply(this, arguments);
	};
}();

var fetchSyncData = function () {
	var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(query, config) {
		var url, response;
		return _regenerator2.default.wrap(function _callee3$(_context3) {
			while (1) {
				switch (_context3.prev = _context3.next) {
					case 0:
						url = "stacks/sync";
						_context3.next = 3;
						return getSyncData(url, config, query, 'items');

					case 3:
						response = _context3.sent;
						return _context3.abrupt("return", response);

					case 5:
					case "end":
						return _context3.stop();
				}
			}
		}, _callee3, undefined);
	}));

	return function fetchSyncData(_x4, _x5) {
		return _ref7.apply(this, arguments);
	};
}();

var fetchCsData = function () {
	var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(url, config, query) {
		var queryParams, apiUrl, option;
		return _regenerator2.default.wrap(function _callee4$(_context4) {
			while (1) {
				switch (_context4.prev = _context4.next) {
					case 0:
						query = query ? query : {};
						query.include_count = true;
						query.api_key = config.api_key;
						query.access_token = config.delivery_token;
						query.environment = config.environment;
						queryParams = queryString.stringify(query);
						apiUrl = config.cdn + "/" + url + "?" + queryParams;
						option = {
							headers: {
								'X-User-Agent': "contentstack-gatsby-source-pilugin-" + version
							}
						};
						return _context4.abrupt("return", new _promise2.default(function (resolve, reject) {
							fetch(apiUrl, option).then(function (response) {
								return response.json();
							}).then(function (data) {
								if (data.error_code) {
									console.error(data);
									reject(data);
								} else {
									resolve(data);
								}
							}).catch(function (err) {
								console.error(err);
								reject(err);
							});
						}));

					case 9:
					case "end":
						return _context4.stop();
				}
			}
		}, _callee4, undefined);
	}));

	return function fetchCsData(_x6, _x7, _x8) {
		return _ref8.apply(this, arguments);
	};
}();

var getPagedData = function () {
	var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(url, config, responseKey) {
		var query = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
		var skip = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
		var limit = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 100;
		var aggregatedResponse = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : null;
		var response;
		return _regenerator2.default.wrap(function _callee5$(_context5) {
			while (1) {
				switch (_context5.prev = _context5.next) {
					case 0:
						query.skip = skip;
						query.limit = limit;
						_context5.next = 4;
						return fetchCsData(url, config, query);

					case 4:
						response = _context5.sent;

						if (!aggregatedResponse) {
							aggregatedResponse = response[responseKey];
						} else {
							aggregatedResponse = aggregatedResponse.concat(response[responseKey]);
						}

						if (!(skip + limit <= response.count)) {
							_context5.next = 8;
							break;
						}

						return _context5.abrupt("return", getPagedData(url, config, responseKey, query = {}, skip + limit, limit, aggregatedResponse));

					case 8:
						return _context5.abrupt("return", aggregatedResponse);

					case 9:
					case "end":
						return _context5.stop();
				}
			}
		}, _callee5, undefined);
	}));

	return function getPagedData(_x9, _x10, _x11) {
		return _ref9.apply(this, arguments);
	};
}();

var getSyncData = function () {
	var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(url, config, query, responseKey) {
		var aggregatedResponse = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
		var response;
		return _regenerator2.default.wrap(function _callee6$(_context6) {
			while (1) {
				switch (_context6.prev = _context6.next) {
					case 0:
						_context6.next = 2;
						return fetchCsData(url, config, query);

					case 2:
						response = _context6.sent;

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

						if (!response.pagination_token) {
							_context6.next = 6;
							break;
						}

						return _context6.abrupt("return", getSyncData(url, config, query = {
							pagination_token: response.pagination_token
						}, responseKey, aggregatedResponse));

					case 6:
						return _context6.abrupt("return", aggregatedResponse);

					case 7:
					case "end":
						return _context6.stop();
				}
			}
		}, _callee6, undefined);
	}));

	return function getSyncData(_x16, _x17, _x18, _x19) {
		return _ref10.apply(this, arguments);
	};
}();