'use strict';

/*
  `node-fetch` have different export depending on CJS or ESM
  context - requiring CJS (regular build) will return a function directly,
  requiring ESM (what is currently being bundled for rendering engines
  which are used by DSG) will return object with `default` field which is
  a function. `preferDefault` helper will just use `.default` if available,
  but will fallback to entire export if not available
*/
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
var preferDefault = function preferDefault(m) {
  return m && m["default"] || m;
};

/**NPM dependencies */
var queryString = require('query-string');
var fetch = preferDefault(require('node-fetch'));

// eslint-disable-next-line import/no-unresolved
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
  CODES = _require4.CODES;
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
var activity;
var globalConfig;
var syncToken = [];
exports.fetchData = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(configOptions, reporter, cache, contentTypeOption) {
    var syncData, entryService, _syncData, contentstackData;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          activity = reporter.activityTimer("Fetching Contentstack data");
          activity.start();
          activity.setStatus('Starting to fetch data from Contentstack');
          _context.prev = 3;
          syncData = {};
          entryService = new OPTIONS_ENTRIES_CLASS_MAPPING[contentTypeOption]();
          _context.next = 8;
          return entryService.fetchSyncData(configOptions, cache, fetchSyncData);
        case 8:
          _syncData = _context.sent;
          syncData.data = _syncData.data;
          contentstackData = {
            syncData: syncData.data
          };
          activity.end();
          return _context.abrupt("return", {
            contentstackData: contentstackData
          });
        case 15:
          _context.prev = 15;
          _context.t0 = _context["catch"](3);
          reporter.panic({
            id: CODES.SyncError,
            context: {
              sourceMessage: "Fetching contentstack data failed. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help."
            },
            error: _context.t0
          });
        case 18:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[3, 15]]);
  }));
  return function (_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();
exports.fetchContentTypes = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(config, contentTypeOption) {
    var url, responseKey, contentType, allContentTypes;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          globalConfig = config;
          _context2.prev = 1;
          config.cdn = config.cdn ? config.cdn : 'https://cdn.contentstack.io/v3';
          url = 'content_types';
          responseKey = 'content_types';
          contentType = new OPTION_CLASS_MAPPING[contentTypeOption]();
          _context2.next = 8;
          return contentType.getPagedData(url, config, responseKey, getPagedData);
        case 8:
          allContentTypes = _context2.sent;
          return _context2.abrupt("return", allContentTypes);
        case 12:
          _context2.prev = 12;
          _context2.t0 = _context2["catch"](1);
          reporter.panic({
            id: CODES.SyncError,
            context: {
              sourceMessage: "Fetching contentstack data failed. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help."
            },
            error: _context2.t0
          });
        case 15:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[1, 12]]);
  }));
  return function (_x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();
var fetchSyncData = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(query, config) {
    var url, response;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          url = 'stacks/sync';
          _context3.next = 3;
          return getSyncData(url, config, query, 'items');
        case 3:
          response = _context3.sent;
          return _context3.abrupt("return", response);
        case 5:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  }));
  return function fetchSyncData(_x7, _x8) {
    return _ref3.apply(this, arguments);
  };
}();
function waitFor(milliseconds) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, milliseconds);
  });
}
var getData = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(url, options) {
    var retries;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          retries = 0;
          return _context5.abrupt("return", new Promise(function (resolve, reject) {
            var handleResponse = function handleResponse() {
              fetch(url, options).then(function (response) {
                return response.json();
              }).then(function (data) {
                if (data.error_code) {
                  console.error(data);
                  if (data.error_code >= 500) {
                    throw new Error("Server error: ".concat(data.error_code));
                  }
                  reject(data);
                } else {
                  if (data.items) {
                    var filteredData = data === null || data === void 0 ? void 0 : data.items.filter(function (item) {
                      return item.data.hasOwnProperty('publish_details');
                    });
                    data.items = filteredData;
                  }
                  resolve(data);
                }
              })["catch"]( /*#__PURE__*/function () {
                var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(err) {
                  var retryAttempt, timeToWait;
                  return _regenerator["default"].wrap(function _callee4$(_context4) {
                    while (1) switch (_context4.prev = _context4.next) {
                      case 0:
                        retryAttempt = globalConfig.httpRetries ? globalConfig.httpRetries : 3;
                        if (!(retries < retryAttempt)) {
                          _context4.next = 9;
                          break;
                        }
                        retries++;
                        timeToWait = Math.pow(2, retries) * 100;
                        _context4.next = 6;
                        return waitFor(timeToWait);
                      case 6:
                        handleResponse();
                        _context4.next = 11;
                        break;
                      case 9:
                        console.error(err);
                        reject(new Error("Fetch failed after ".concat(retryAttempt, " retry attempts.")));
                      case 11:
                      case "end":
                        return _context4.stop();
                    }
                  }, _callee4);
                }));
                return function (_x11) {
                  return _ref5.apply(this, arguments);
                };
              }());
            };
            retries = 1;
            handleResponse();
          }));
        case 2:
        case "end":
          return _context5.stop();
      }
    }, _callee5);
  }));
  return function getData(_x9, _x10) {
    return _ref4.apply(this, arguments);
  };
}();
var fetchCsData = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(url, config, query) {
    var queryParams, apiUrl, option, data;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
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
          _context6.next = 8;
          return getData(apiUrl, option);
        case 8:
          data = _context6.sent;
          return _context6.abrupt("return", data);
        case 10:
        case "end":
          return _context6.stop();
      }
    }, _callee6);
  }));
  return function fetchCsData(_x12, _x13, _x14) {
    return _ref6.apply(this, arguments);
  };
}();
var getPagedData = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])(function (url, config, responseKey) {
    var query = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var skip = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
    var limit = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 100;
    var aggregatedResponse = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : null;
    return /*#__PURE__*/_regenerator["default"].mark(function _callee7() {
      var response;
      return _regenerator["default"].wrap(function _callee7$(_context7) {
        while (1) switch (_context7.prev = _context7.next) {
          case 0:
            query.skip = skip;
            query.limit = limit;
            query.include_global_field_schema = true;
            _context7.next = 5;
            return fetchCsData(url, config, query);
          case 5:
            response = _context7.sent;
            if (!aggregatedResponse) {
              aggregatedResponse = response[responseKey];
            } else {
              aggregatedResponse = aggregatedResponse.concat(response[responseKey]);
            }
            if (!(skip + limit <= response.count)) {
              _context7.next = 9;
              break;
            }
            return _context7.abrupt("return", getPagedData(url, config, responseKey, query = {}, skip + limit, limit, aggregatedResponse));
          case 9:
            return _context7.abrupt("return", aggregatedResponse);
          case 10:
          case "end":
            return _context7.stop();
        }
      }, _callee7);
    })();
  });
  return function getPagedData(_x15, _x16, _x17) {
    return _ref7.apply(this, arguments);
  };
}();
var getSyncData = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])(function (url, config, query, responseKey) {
    var aggregatedResponse = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    return /*#__PURE__*/_regenerator["default"].mark(function _callee8() {
      var response, aggregatedSyncToken, _iterator, _step, _aggregatedResponse$d, _aggregatedResponse$d2, token, syncResponse;
      return _regenerator["default"].wrap(function _callee8$(_context8) {
        while (1) switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return fetchCsData(url, config, query);
          case 2:
            response = _context8.sent;
            if (response.items.some(function (item) {
              return ['entry_published', 'asset_published'].includes(item.type);
            })) {
              syncToken.push(response.sync_token);
            }
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
              _context8.next = 7;
              break;
            }
            return _context8.abrupt("return", getSyncData(url, config, query = {
              pagination_token: response.pagination_token
            }, responseKey, aggregatedResponse));
          case 7:
            if (!response.sync_token) {
              _context8.next = 29;
              break;
            }
            /**
             * Below array would contain type --> 'asset_published', 'entry_published' sync tokens
             * To make final sync call and concatenate the result if found any during on fetch request.
             */
            aggregatedSyncToken = syncToken.filter(function (item) {
              return item !== undefined;
            });
            _iterator = _createForOfIteratorHelper(aggregatedSyncToken);
            _context8.prev = 10;
            _iterator.s();
          case 12:
            if ((_step = _iterator.n()).done) {
              _context8.next = 21;
              break;
            }
            token = _step.value;
            _context8.next = 16;
            return fetchCsData(url, config, query = {
              sync_token: token
            });
          case 16:
            syncResponse = _context8.sent;
            aggregatedResponse.data = (_aggregatedResponse$d = aggregatedResponse.data) === null || _aggregatedResponse$d === void 0 ? void 0 : (_aggregatedResponse$d2 = _aggregatedResponse$d).concat.apply(_aggregatedResponse$d2, (0, _toConsumableArray2["default"])(syncResponse.items));
            aggregatedResponse.sync_token = syncResponse.sync_token;
          case 19:
            _context8.next = 12;
            break;
          case 21:
            _context8.next = 26;
            break;
          case 23:
            _context8.prev = 23;
            _context8.t0 = _context8["catch"](10);
            _iterator.e(_context8.t0);
          case 26:
            _context8.prev = 26;
            _iterator.f();
            return _context8.finish(26);
          case 29:
            return _context8.abrupt("return", aggregatedResponse);
          case 30:
          case "end":
            return _context8.stop();
        }
      }, _callee8, null, [[10, 23, 26, 29]]);
    })();
  });
  return function getSyncData(_x18, _x19, _x20, _x21) {
    return _ref8.apply(this, arguments);
  };
}();
//# sourceMappingURL=fetch.js.map