'use strict';
/**NPM dependencies */

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var queryString = require('query-string');

var fetch = require('node-fetch'); // eslint-disable-next-line import/no-unresolved


var _require = require('./package.json'),
    version = _require.version;

var _require2 = require('./contenttype-data'),
    FetchDefaultContentTypes = _require2.FetchDefaultContentTypes,
    FetchSpecifiedContentTypes = _require2.FetchSpecifiedContentTypes,
    FetchUnspecifiedContentTypes = _require2.FetchUnspecifiedContentTypes;

var _require3 = require('./entry-data'),
    FetchDefaultEntries = _require3.FetchDefaultEntries,
    FetchSpecifiedContentTypesEntries = _require3.FetchSpecifiedContentTypesEntries,
    FetchSpecifiedLocalesEntries = _require3.FetchSpecifiedLocalesEntries,
    FetchSpecifiedLocalesAndContentTypesEntries = _require3.FetchSpecifiedLocalesAndContentTypesEntries;

var _require4 = require('./utils'),
    CODES = _require4.CODES,
    LAST_CONTENT_TYPE_FETCH_TIME = _require4.LAST_CONTENT_TYPE_FETCH_TIME,
    DEFAULT_CONTENT_TYPE_FETCH_TIME = _require4.DEFAULT_CONTENT_TYPE_FETCH_TIME;

var OPTION_CLASS_MAPPING = {
  '': FetchDefaultContentTypes,
  contentTypes: FetchSpecifiedContentTypes,
  excludeContentTypes: FetchUnspecifiedContentTypes,
  locales: FetchDefaultContentTypes,
  contentTypeslocales: FetchSpecifiedContentTypes,
  excludeContentTypeslocales: FetchUnspecifiedContentTypes
};
var OPTIONS_ENTRIES_CLASS_MAPPING = {
  '': FetchDefaultEntries,
  contentTypes: FetchSpecifiedContentTypesEntries,
  excludeContentTypes: FetchSpecifiedContentTypesEntries,
  locales: FetchSpecifiedLocalesEntries,
  contentTypeslocales: FetchSpecifiedLocalesAndContentTypesEntries,
  excludeContentTypeslocales: FetchSpecifiedLocalesAndContentTypesEntries
};

exports.fetchData = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(configOptions, reporter, cache, contentTypeOption) {
    var syncData, typePrefix, lastFetchTimeKey, contentTypeFetchTimeQuery, currentTime, query, entryService, _syncData, contentstackData;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            console.time('Fetch Contentstack data');
            console.log('Starting to fetch data from Contentstack');
            _context.prev = 2;
            syncData = {};
            typePrefix = configOptions.type_prefix || 'Contentstack';
            lastFetchTimeKey = "".concat(typePrefix, "_").concat(configOptions.api_key, "_").concat(LAST_CONTENT_TYPE_FETCH_TIME);
            contentTypeFetchTimeQuery = getLastContentTypeFetchTime(lastFetchTimeKey, cache); // Cache the current time from when the changes in content-types changed will be detected.

            currentTime = new Date();
            currentTime = currentTime.toISOString();
            query = {
              include_global_field_schema: true,
              query: _objectSpread({}, contentTypeFetchTimeQuery)
            };
            entryService = new OPTIONS_ENTRIES_CLASS_MAPPING[contentTypeOption](query);
            _context.next = 13;
            return entryService.fetchSyncData(configOptions, cache, fetchSyncData);

          case 13:
            _syncData = _context.sent;
            syncData.data = _syncData.data;
            contentstackData = {
              syncData: syncData.data
            };
            console.timeEnd('Fetch Contentstack data'); // Set last fetch time here.

            _context.next = 19;
            return cache.set(lastFetchTimeKey, currentTime);

          case 19:
            return _context.abrupt("return", {
              contentstackData: contentstackData
            });

          case 22:
            _context.prev = 22;
            _context.t0 = _context["catch"](2);
            reporter.panic({
              id: CODES.SyncError,
              context: {
                sourceMessage: "Fetching contentstack data failed. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help."
              },
              error: _context.t0
            });

          case 25:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[2, 22]]);
  }));

  return function (_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();

var getLastContentTypeFetchTime = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(lastFetchTimeKey, cache) {
    var lastFetch, fetchTimeQuery;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return cache.get(lastFetchTimeKey);

          case 2:
            lastFetch = _context2.sent;
            fetchTimeQuery = {};

            if (lastFetch) {
              fetchTimeQuery.updated_at = lastFetch;
            } else {
              fetchTimeQuery.created_at = DEFAULT_CONTENT_TYPE_FETCH_TIME;
            }

            return _context2.abrupt("return", fetchTimeQuery);

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function getLastContentTypeFetchTime(_x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();

exports.fetchContentTypes = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(config, contentTypeOption) {
    var url, responseKey, contentType, allContentTypes;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            config.cdn = config.cdn ? config.cdn : 'https://cdn.contentstack.io/v3';
            url = 'content_types';
            responseKey = 'content_types';
            contentType = new OPTION_CLASS_MAPPING[contentTypeOption]();
            _context3.next = 7;
            return contentType.getPagedData(url, config, responseKey, getPagedData);

          case 7:
            allContentTypes = _context3.sent;
            return _context3.abrupt("return", allContentTypes);

          case 11:
            _context3.prev = 11;
            _context3.t0 = _context3["catch"](0);
            reporter.panic({
              id: CODES.SyncError,
              context: {
                sourceMessage: "Fetching contentstack data failed. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help."
              },
              error: _context3.t0
            });

          case 14:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 11]]);
  }));

  return function (_x7, _x8) {
    return _ref3.apply(this, arguments);
  };
}();

var fetchSyncData = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(query, config) {
    var url, response;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            url = 'stacks/sync';
            _context4.next = 3;
            return getSyncData(url, config, query, 'items');

          case 3:
            response = _context4.sent;
            return _context4.abrupt("return", response);

          case 5:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function fetchSyncData(_x9, _x10) {
    return _ref4.apply(this, arguments);
  };
}();

var fetchCsData = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(url, config, query) {
    var queryParams, apiUrl, option;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            query = query || {};
            query.include_count = true;
            query.environment = config.environment;
            queryParams = queryString.stringify(query);
            apiUrl = "".concat(config.cdn, "/").concat(url, "?").concat(queryParams);
            option = {
              headers: {
                'X-User-Agent': "contentstack-gatsby-source-plugin-".concat(version),
                api_key: config.api_key,
                access_token: config.delivery_token
              }
            };
            return _context5.abrupt("return", new Promise(function (resolve, reject) {
              fetch(apiUrl, option).then(function (response) {
                return response.json();
              }).then(function (data) {
                if (data.error_code) {
                  console.error(data);
                  reject(data);
                } else {
                  resolve(data);
                }
              })["catch"](function (err) {
                console.error(err);
                reject(err);
              });
            }));

          case 7:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function fetchCsData(_x11, _x12, _x13) {
    return _ref5.apply(this, arguments);
  };
}();

var getPagedData = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(url, config, responseKey) {
    var query,
        skip,
        limit,
        aggregatedResponse,
        response,
        _args6 = arguments;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            query = _args6.length > 3 && _args6[3] !== undefined ? _args6[3] : {};
            skip = _args6.length > 4 && _args6[4] !== undefined ? _args6[4] : 0;
            limit = _args6.length > 5 && _args6[5] !== undefined ? _args6[5] : 100;
            aggregatedResponse = _args6.length > 6 && _args6[6] !== undefined ? _args6[6] : null;
            query.skip = skip;
            query.limit = limit;
            query.include_global_field_schema = true;
            _context6.next = 9;
            return fetchCsData(url, config, query);

          case 9:
            response = _context6.sent;

            if (!aggregatedResponse) {
              aggregatedResponse = response[responseKey];
            } else {
              aggregatedResponse = aggregatedResponse.concat(response[responseKey]);
            }

            if (!(skip + limit <= response.count)) {
              _context6.next = 13;
              break;
            }

            return _context6.abrupt("return", getPagedData(url, config, responseKey, query = {}, skip + limit, limit, aggregatedResponse));

          case 13:
            return _context6.abrupt("return", aggregatedResponse);

          case 14:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function getPagedData(_x14, _x15, _x16) {
    return _ref6.apply(this, arguments);
  };
}();

var getSyncData = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(url, config, query, responseKey) {
    var aggregatedResponse,
        response,
        _args7 = arguments;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            aggregatedResponse = _args7.length > 4 && _args7[4] !== undefined ? _args7[4] : null;
            _context7.next = 3;
            return fetchCsData(url, config, query);

          case 3:
            response = _context7.sent;

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
              _context7.next = 7;
              break;
            }

            return _context7.abrupt("return", getSyncData(url, config, query = {
              pagination_token: response.pagination_token
            }, responseKey, aggregatedResponse));

          case 7:
            return _context7.abrupt("return", aggregatedResponse);

          case 8:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function getSyncData(_x17, _x18, _x19, _x20) {
    return _ref7.apply(this, arguments);
  };
}();