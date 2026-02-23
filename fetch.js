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
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
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
  CODES = _require4.CODES,
  getCustomHeaders = _require4.getCustomHeaders;
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
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(configOptions, reporter, cache, contentTypeOption) {
    var syncData, entryService, _syncData, contentstackData, _t;
    return _regenerator["default"].wrap(function (_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          activity = reporter.activityTimer("Fetching Contentstack data");
          activity.start();
          activity.setStatus('Starting to fetch data from Contentstack');
          _context.prev = 1;
          syncData = {};
          entryService = new OPTIONS_ENTRIES_CLASS_MAPPING[contentTypeOption]();
          _context.next = 2;
          return entryService.fetchSyncData(configOptions, cache, fetchSyncData);
        case 2:
          _syncData = _context.sent;
          syncData.data = _syncData.data;
          contentstackData = {
            syncData: syncData.data
          };
          activity.end();
          return _context.abrupt("return", {
            contentstackData: contentstackData
          });
        case 3:
          _context.prev = 3;
          _t = _context["catch"](1);
          reporter.panic({
            id: CODES.SyncError,
            context: {
              sourceMessage: "Fetching contentstack data failed. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help."
            },
            error: _t
          });
        case 4:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[1, 3]]);
  }));
  return function (_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();
exports.fetchContentTypes = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(config, contentTypeOption) {
    var url, responseKey, contentType, allContentTypes, _t2;
    return _regenerator["default"].wrap(function (_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          globalConfig = config;
          _context2.prev = 1;
          config.cdn = config.cdn ? config.cdn : 'https://cdn.contentstack.io/v3';
          url = 'content_types';
          responseKey = 'content_types';
          contentType = new OPTION_CLASS_MAPPING[contentTypeOption]();
          _context2.next = 2;
          return contentType.getPagedData(url, config, responseKey, _getPagedData);
        case 2:
          allContentTypes = _context2.sent;
          return _context2.abrupt("return", allContentTypes);
        case 3:
          _context2.prev = 3;
          _t2 = _context2["catch"](1);
          reporter.panic({
            id: CODES.SyncError,
            context: {
              sourceMessage: "Fetching contentstack data failed. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help."
            },
            error: _t2
          });
        case 4:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[1, 3]]);
  }));
  return function (_x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();
var fetchSyncData = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(query, config) {
    var url, response;
    return _regenerator["default"].wrap(function (_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          url = 'stacks/sync';
          _context3.next = 1;
          return getSyncData(url, config, query, 'items');
        case 1:
          response = _context3.sent;
          return _context3.abrupt("return", response);
        case 2:
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
  var _ref4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(url, options) {
    var retries;
    return _regenerator["default"].wrap(function (_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          retries = 0;
          return _context5.abrupt("return", new Promise(function (resolve, reject) {
            var _handleResponse = function handleResponse() {
              fetch(url, options).then(function (response) {
                return response.json();
              }).then(function (data) {
                if (data.error_code) {
                  if (data.error_code === 141) {
                    console.warn("Error ".concat(data.error_code, ": ").concat(data.error_message, ". Details: ").concat(JSON.stringify(data.errors)));
                    console.info("Retrying... Please wait...");
                  } else if (data.error_code >= 500) {
                    throw new Error("Server error: ".concat(data.error_code));
                  } else {
                    console.error("data");
                  }
                  reject(data);
                } else {
                  resolve(data);
                }
              })["catch"](/*#__PURE__*/function () {
                var _ref5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(err) {
                  var retryAttempt, timeToWait;
                  return _regenerator["default"].wrap(function (_context4) {
                    while (1) switch (_context4.prev = _context4.next) {
                      case 0:
                        retryAttempt = globalConfig.httpRetries ? globalConfig.httpRetries : 3;
                        if (!(retries < retryAttempt)) {
                          _context4.next = 2;
                          break;
                        }
                        retries++;
                        timeToWait = Math.pow(2, retries) * 100;
                        _context4.next = 1;
                        return waitFor(timeToWait);
                      case 1:
                        _handleResponse();
                        _context4.next = 3;
                        break;
                      case 2:
                        reject(new Error("Fetch failed after ".concat(retryAttempt, " retry attempts.")));
                      case 3:
                      case "end":
                        return _context4.stop();
                    }
                  }, _callee4);
                }));
                return function (_x1) {
                  return _ref5.apply(this, arguments);
                };
              }());
            };
            retries = 1;
            _handleResponse();
          }));
        case 1:
        case "end":
          return _context5.stop();
      }
    }, _callee5);
  }));
  return function getData(_x9, _x0) {
    return _ref4.apply(this, arguments);
  };
}();
var fetchCsData = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee6(url, config, query) {
    var queryParams, apiUrl, option, data;
    return _regenerator["default"].wrap(function (_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          query = query || {};
          query.include_count = true;
          query.environment = config.environment;
          queryParams = queryString.stringify(query);
          apiUrl = "".concat(config.cdn, "/").concat(url, "?").concat(queryParams);
          option = {
            headers: _objectSpread({
              'X-User-Agent': "contentstack-gatsby-source-plugin-".concat(version),
              api_key: config === null || config === void 0 ? void 0 : config.api_key,
              access_token: config === null || config === void 0 ? void 0 : config.delivery_token,
              branch: config !== null && config !== void 0 && config.branch ? config.branch : 'main'
            }, getCustomHeaders(config === null || config === void 0 ? void 0 : config.enableEarlyAccessKey, config === null || config === void 0 ? void 0 : config.enableEarlyAccessValue))
          };
          _context6.next = 1;
          return getData(apiUrl, option);
        case 1:
          data = _context6.sent;
          return _context6.abrupt("return", data);
        case 2:
        case "end":
          return _context6.stop();
      }
    }, _callee6);
  }));
  return function fetchCsData(_x10, _x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}();
var _getPagedData = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])(function (url, config, responseKey) {
    var query = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var skip = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
    var limit = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : config === null || config === void 0 ? void 0 : config.limit;
    var aggregatedResponse = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : null;
    return /*#__PURE__*/_regenerator["default"].mark(function _callee7() {
      var response;
      return _regenerator["default"].wrap(function (_context7) {
        while (1) switch (_context7.prev = _context7.next) {
          case 0:
            query.skip = skip;
            //if limit is greater than 100, it will throw ann error that limit cannot exceed 100.
            if (limit > 100) {
              console.error('Limit cannot exceed 100. Setting limit to 50.');
            }
            query.limit = limit > 100 ? 50 : limit;
            query.include_global_field_schema = true;
            _context7.next = 1;
            return fetchCsData(url, config, query);
          case 1:
            response = _context7.sent;
            if (!aggregatedResponse) {
              aggregatedResponse = response[responseKey];
            } else {
              aggregatedResponse = aggregatedResponse.concat(response[responseKey]);
            }
            if (!(skip + limit <= response.count)) {
              _context7.next = 2;
              break;
            }
            return _context7.abrupt("return", _getPagedData(url, config, responseKey, query = {}, skip + limit, limit, aggregatedResponse));
          case 2:
            return _context7.abrupt("return", aggregatedResponse);
          case 3:
          case "end":
            return _context7.stop();
        }
      }, _callee7);
    })();
  });
  return function getPagedData(_x13, _x14, _x15) {
    return _ref7.apply(this, arguments);
  };
}();
var getSyncData = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])(function (url, config, query, responseKey) {
    var aggregatedResponse = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    var retries = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
    return /*#__PURE__*/_regenerator["default"].mark(function _callee8() {
      var response, syncEvents, _t3;
      return _regenerator["default"].wrap(function (_context8) {
        while (1) switch (_context8.prev = _context8.next) {
          case 0:
            _context8.prev = 0;
            _context8.next = 1;
            return fetchCsData(url, config, query);
          case 1:
            response = _context8.sent;
            syncEvents = ['entry_published', 'asset_published']; // Collect sync tokens from response items
            if (response.items.some(function (item) {
              return syncEvents.includes(item.type);
            }) && response.sync_token) {
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

            // Handle pagination
            if (!response.pagination_token) {
              _context8.next = 2;
              break;
            }
            _context8.next = 2;
            return _handlePagination(url, config, response.pagination_token, responseKey, aggregatedResponse);
          case 2:
            if (!response.sync_token) {
              _context8.next = 4;
              break;
            }
            _context8.next = 3;
            return processSyncTokens(url, config, aggregatedResponse, syncToken);
          case 3:
            aggregatedResponse = _context8.sent;
          case 4:
            return _context8.abrupt("return", aggregatedResponse);
          case 5:
            _context8.prev = 5;
            _t3 = _context8["catch"](0);
            throw new Error("Failed to fetch sync data: ".concat(_t3.message));
          case 6:
          case "end":
            return _context8.stop();
        }
      }, _callee8, null, [[0, 5]]);
    })();
  });
  return function getSyncData(_x16, _x17, _x18, _x19) {
    return _ref8.apply(this, arguments);
  };
}();
var processSyncTokens = /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee9(url, config, aggregatedResponse, syncToken) {
    var aggregatedSyncToken, _iterator, _step, token, syncResponse, SyncRetryCount, delay, _aggregatedResponse$d, _t4, _t5;
    return _regenerator["default"].wrap(function (_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          // Remove Duplicate/ undefined sync tokens [if any] before iterating.
          aggregatedSyncToken = (0, _toConsumableArray2["default"])(new Set(syncToken.filter(function (item) {
            return item !== undefined;
          }))); // Clear the syncToken array so further processing won’t include already handled tokens.
          syncToken.length = 0;
          _iterator = _createForOfIteratorHelper(aggregatedSyncToken);
          _context9.prev = 1;
          _iterator.s();
        case 2:
          if ((_step = _iterator.n()).done) {
            _context9.next = 12;
            break;
          }
          token = _step.value;
          syncResponse = void 0;
          SyncRetryCount = 0; // Attempt to fetch data using the token, with retries.
        case 3:
          if (!(SyncRetryCount <= config.httpRetries)) {
            _context9.next = 10;
            break;
          }
          _context9.prev = 4;
          _context9.next = 5;
          return fetchCsData(url, config, {
            sync_token: token
          });
        case 5:
          syncResponse = _context9.sent;
          return _context9.abrupt("continue", 10);
        case 6:
          _context9.prev = 6;
          _t4 = _context9["catch"](4);
          SyncRetryCount++;
          if (!(SyncRetryCount <= config.httpRetries)) {
            _context9.next = 8;
            break;
          }
          delay = Math.min(Math.pow(2, SyncRetryCount) * 1000, 30000); // To prevent excessive long waits we cap the delays  at 30s
          _context9.next = 7;
          return waitFor(delay);
        case 7:
          _context9.next = 9;
          break;
        case 8:
          throw new Error("Failed after ".concat(config.httpRetries, " retries due to a sync token error."));
        case 9:
          _context9.next = 3;
          break;
        case 10:
          if (syncResponse) {
            aggregatedResponse.data = (_aggregatedResponse$d = aggregatedResponse.data) === null || _aggregatedResponse$d === void 0 ? void 0 : _aggregatedResponse$d.concat.apply(_aggregatedResponse$d, (0, _toConsumableArray2["default"])(syncResponse.items));
            aggregatedResponse.sync_token = syncResponse.sync_token;
          }
        case 11:
          _context9.next = 2;
          break;
        case 12:
          _context9.next = 14;
          break;
        case 13:
          _context9.prev = 13;
          _t5 = _context9["catch"](1);
          _iterator.e(_t5);
        case 14:
          _context9.prev = 14;
          _iterator.f();
          return _context9.finish(14);
        case 15:
          return _context9.abrupt("return", aggregatedResponse);
        case 16:
        case "end":
          return _context9.stop();
      }
    }, _callee9, null, [[1, 13, 14, 15], [4, 6]]);
  }));
  return function processSyncTokens(_x20, _x21, _x22, _x23) {
    return _ref9.apply(this, arguments);
  };
}();
var _handlePagination = /*#__PURE__*/function () {
  var _ref0 = (0, _asyncToGenerator2["default"])(function (url, config, paginationToken, responseKey, aggregatedResponse) {
    var retries = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
    return /*#__PURE__*/_regenerator["default"].mark(function _callee0() {
      var retryDelay, _t6;
      return _regenerator["default"].wrap(function (_context0) {
        while (1) switch (_context0.prev = _context0.next) {
          case 0:
            _context0.prev = 0;
            _context0.next = 1;
            return getSyncData(url, config, {
              pagination_token: paginationToken
            }, responseKey, aggregatedResponse, 0);
          case 1:
            return _context0.abrupt("return", _context0.sent);
          case 2:
            _context0.prev = 2;
            _t6 = _context0["catch"](0);
            if (!(retries < config.httpRetries)) {
              _context0.next = 5;
              break;
            }
            retryDelay = Math.min(Math.pow(2, retries) * 1000, 30000);
            _context0.next = 3;
            return waitFor(retryDelay);
          case 3:
            _context0.next = 4;
            return _handlePagination(url, config, paginationToken, responseKey, aggregatedResponse, retries + 1);
          case 4:
            return _context0.abrupt("return", _context0.sent);
          case 5:
            throw new Error("Failed after ".concat(config.httpRetries, " retries due to a pagination token error."));
          case 6:
          case "end":
            return _context0.stop();
        }
      }, _callee0, null, [[0, 2]]);
    })();
  });
  return function handlePagination(_x24, _x25, _x26, _x27, _x28) {
    return _ref0.apply(this, arguments);
  };
}();
//# sourceMappingURL=fetch.js.map