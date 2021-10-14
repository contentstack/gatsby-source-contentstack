'use strict';
/**NPM dependencies */

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var queryString = require('query-string');

var fetch = require('node-fetch'); // eslint-disable-next-line import/no-unresolved


var _require = require('./package.json'),
    version = _require.version;

var _require2 = require('./utils'),
    CODES = _require2.CODES;

var FetchContentTypes = /*#__PURE__*/function () {
  function FetchContentTypes() {
    (0, _classCallCheck2["default"])(this, FetchContentTypes);
  }

  (0, _createClass2["default"])(FetchContentTypes, [{
    key: "getPagedData",
    value: function () {
      var _getPagedData = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function getPagedData() {
        return _getPagedData.apply(this, arguments);
      }

      return getPagedData;
    }()
  }]);
  return FetchContentTypes;
}();

var FetchDefaultContentTypes = /*#__PURE__*/function (_FetchContentTypes) {
  (0, _inherits2["default"])(FetchDefaultContentTypes, _FetchContentTypes);

  var _super = _createSuper(FetchDefaultContentTypes);

  function FetchDefaultContentTypes() {
    (0, _classCallCheck2["default"])(this, FetchDefaultContentTypes);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(FetchDefaultContentTypes, [{
    key: "getPagedData",
    value: function () {
      var _getPagedData3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(url, config, responseKey) {
        var query, result;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                query = {
                  include_global_field_schema: true
                };
                _context2.next = 3;
                return _getPagedData2(url, config, responseKey, query);

              case 3:
                result = _context2.sent;
                return _context2.abrupt("return", result);

              case 5:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function getPagedData(_x, _x2, _x3) {
        return _getPagedData3.apply(this, arguments);
      }

      return getPagedData;
    }()
  }]);
  return FetchDefaultContentTypes;
}(FetchContentTypes);

var FetchSpecifiedContentTypes = /*#__PURE__*/function (_FetchContentTypes2) {
  (0, _inherits2["default"])(FetchSpecifiedContentTypes, _FetchContentTypes2);

  var _super2 = _createSuper(FetchSpecifiedContentTypes);

  function FetchSpecifiedContentTypes() {
    (0, _classCallCheck2["default"])(this, FetchSpecifiedContentTypes);
    return _super2.apply(this, arguments);
  }

  (0, _createClass2["default"])(FetchSpecifiedContentTypes, [{
    key: "getPagedData",
    value: function () {
      var _getPagedData4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(url, config, responseKey) {
        var query, result;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                query = {
                  query: JSON.stringify({
                    uid: {
                      $in: config.includeContentTypes
                    }
                  }),
                  include_global_field_schema: true
                };
                _context3.next = 3;
                return _getPagedData2(url, config, responseKey, query);

              case 3:
                result = _context3.sent;
                return _context3.abrupt("return", result);

              case 5:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function getPagedData(_x4, _x5, _x6) {
        return _getPagedData4.apply(this, arguments);
      }

      return getPagedData;
    }()
  }]);
  return FetchSpecifiedContentTypes;
}(FetchContentTypes);

var FetchUnspecifiedContentTypes = /*#__PURE__*/function (_FetchContentTypes3) {
  (0, _inherits2["default"])(FetchUnspecifiedContentTypes, _FetchContentTypes3);

  var _super3 = _createSuper(FetchUnspecifiedContentTypes);

  function FetchUnspecifiedContentTypes() {
    (0, _classCallCheck2["default"])(this, FetchUnspecifiedContentTypes);
    return _super3.apply(this, arguments);
  }

  (0, _createClass2["default"])(FetchUnspecifiedContentTypes, [{
    key: "getPagedData",
    value: function () {
      var _getPagedData5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(url, config, responseKey) {
        var query, result;
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                query = {
                  query: JSON.stringify({
                    uid: {
                      $nin: config.excludeContentTypes
                    }
                  }),
                  include_global_field_schema: true
                };
                _context4.next = 3;
                return _getPagedData2(url, config, responseKey, query);

              case 3:
                result = _context4.sent;
                return _context4.abrupt("return", result);

              case 5:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));

      function getPagedData(_x7, _x8, _x9) {
        return _getPagedData5.apply(this, arguments);
      }

      return getPagedData;
    }()
  }]);
  return FetchUnspecifiedContentTypes;
}(FetchContentTypes);

var OPTION_CLASS_MAPPING = {
  '': FetchDefaultContentTypes,
  includeContentTypes: FetchSpecifiedContentTypes,
  excludeContentTypes: FetchUnspecifiedContentTypes
};

var FetchEntries = /*#__PURE__*/function () {
  function FetchEntries() {
    (0, _classCallCheck2["default"])(this, FetchEntries);
  }

  (0, _createClass2["default"])(FetchEntries, [{
    key: "fetchSyncData",
    value: function () {
      var _fetchSyncData = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5() {
        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));

      function fetchSyncData() {
        return _fetchSyncData.apply(this, arguments);
      }

      return fetchSyncData;
    }()
  }]);
  return FetchEntries;
}();

var FetchDefaultEntries = /*#__PURE__*/function (_FetchEntries) {
  (0, _inherits2["default"])(FetchDefaultEntries, _FetchEntries);

  var _super4 = _createSuper(FetchDefaultEntries);

  function FetchDefaultEntries() {
    (0, _classCallCheck2["default"])(this, FetchDefaultEntries);
    return _super4.apply(this, arguments);
  }

  (0, _createClass2["default"])(FetchDefaultEntries, [{
    key: "fetchSyncData",
    value: function () {
      var _fetchSyncData3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(configOptions, reporter, cache) {
        var typePrefix, tokenKey, syncToken, syncData, syncEntryParams, syncAssetParams, _yield$Promise$all, _yield$Promise$all2, syncEntryData, syncAssetData, data, syncParams;

        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                typePrefix = configOptions.type_prefix || 'Contentstack';
                tokenKey = "".concat(typePrefix.toLowerCase(), "-sync-token-").concat(configOptions.api_key);
                _context6.next = 4;
                return cache.get(tokenKey);

              case 4:
                syncToken = _context6.sent;
                syncData = {};

                if (!configOptions.expediteBuild) {
                  _context6.next = 28;
                  break;
                }

                syncEntryParams = syncToken ? {
                  sync_token: syncToken
                } : {
                  init: true
                }; // TODO: make a copy of syncEntryParams.

                syncAssetParams = syncToken ? {
                  sync_token: syncToken
                } : {
                  init: true
                };
                syncEntryParams.type = 'entry_published, entry_unpublished, entry_deleted';
                syncAssetParams.type = 'asset_published, asset_unpublished, asset_deleted';
                _context6.prev = 11;
                _context6.next = 14;
                return Promise.all([_fetchSyncData2(syncEntryParams, configOptions), _fetchSyncData2(syncAssetParams, configOptions)]);

              case 14:
                _yield$Promise$all = _context6.sent;
                _yield$Promise$all2 = (0, _slicedToArray2["default"])(_yield$Promise$all, 2);
                syncEntryData = _yield$Promise$all2[0];
                syncAssetData = _yield$Promise$all2[1];
                data = syncEntryData.data.concat(syncAssetData.data);
                syncData.data = data;
                syncData.sync_token = data.sync_token;
                _context6.next = 26;
                break;

              case 23:
                _context6.prev = 23;
                _context6.t0 = _context6["catch"](11);
                reporter.panic({
                  id: CODES.SyncError,
                  context: {
                    sourceMessage: "Fetching contentstack data failed [expediteBuild]. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help."
                  },
                  error: _context6.t0
                });

              case 26:
                _context6.next = 38;
                break;

              case 28:
                syncParams = syncToken ? {
                  sync_token: syncToken
                } : {
                  init: true
                };
                _context6.prev = 29;
                _context6.next = 32;
                return _fetchSyncData2(syncParams, configOptions);

              case 32:
                syncData = _context6.sent;
                _context6.next = 38;
                break;

              case 35:
                _context6.prev = 35;
                _context6.t1 = _context6["catch"](29);
                reporter.panic({
                  id: CODES.SyncError,
                  context: {
                    sourceMessage: "Fetching contentstack data failed. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help."
                  },
                  error: _context6.t1
                });

              case 38:
                _context6.next = 40;
                return cache.set(tokenKey, syncData.sync_token);

              case 40:
                return _context6.abrupt("return", syncData);

              case 41:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, null, [[11, 23], [29, 35]]);
      }));

      function fetchSyncData(_x10, _x11, _x12) {
        return _fetchSyncData3.apply(this, arguments);
      }

      return fetchSyncData;
    }()
  }]);
  return FetchDefaultEntries;
}(FetchEntries);

var FetchSpecifiedContentTypesEntries = /*#__PURE__*/function (_FetchEntries2) {
  (0, _inherits2["default"])(FetchSpecifiedContentTypesEntries, _FetchEntries2);

  var _super5 = _createSuper(FetchSpecifiedContentTypesEntries);

  function FetchSpecifiedContentTypesEntries() {
    (0, _classCallCheck2["default"])(this, FetchSpecifiedContentTypesEntries);
    return _super5.apply(this, arguments);
  }

  (0, _createClass2["default"])(FetchSpecifiedContentTypesEntries, [{
    key: "fetchSyncData",
    value: function () {
      var _fetchSyncData4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(configOptions, reporter, cache) {
        var typePrefix, contentTypes, syncData, i, contentType, tokenKey, syncToken, syncParams, _syncData;

        return _regenerator["default"].wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                typePrefix = configOptions.type_prefix || 'Contentstack';
                _context7.next = 3;
                return cache.get(typePrefix);

              case 3:
                contentTypes = _context7.sent;
                syncData = {};
                i = 0;

              case 6:
                if (!(i < contentTypes.length)) {
                  _context7.next = 30;
                  break;
                }

                contentType = contentTypes[i].uid;
                tokenKey = "".concat(typePrefix.toLowerCase(), "-sync-token-").concat(contentType, "-").concat(configOptions.api_key);
                _context7.prev = 9;
                _context7.next = 12;
                return cache.get(tokenKey);

              case 12:
                syncToken = _context7.sent;
                syncParams = syncToken ? {
                  sync_token: syncToken
                } : {
                  init: true
                };
                !syncToken && (syncParams.content_type_uid = contentType);
                _context7.next = 17;
                return _fetchSyncData2(syncParams, configOptions);

              case 17:
                _syncData = _context7.sent;
                syncData.data = syncData.data || [];
                syncData.data = syncData.data.concat(_syncData.data); // Caching token for the next sync.

                _context7.next = 22;
                return cache.set(tokenKey, _syncData.sync_token);

              case 22:
                _context7.next = 27;
                break;

              case 24:
                _context7.prev = 24;
                _context7.t0 = _context7["catch"](9);
                reporter.panic({
                  id: CODES.SyncError,
                  context: {
                    sourceMessage: "Fetching contentstack data failed. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help."
                  },
                  error: _context7.t0
                });

              case 27:
                i++;
                _context7.next = 6;
                break;

              case 30:
                return _context7.abrupt("return", syncData);

              case 31:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, null, [[9, 24]]);
      }));

      function fetchSyncData(_x13, _x14, _x15) {
        return _fetchSyncData4.apply(this, arguments);
      }

      return fetchSyncData;
    }()
  }]);
  return FetchSpecifiedContentTypesEntries;
}(FetchEntries);

var OPTIONS_ENTRIES_CLASS_MAPPING = {
  '': FetchDefaultEntries,
  includeContentTypes: FetchSpecifiedContentTypesEntries,
  excludeContentTypes: FetchSpecifiedContentTypesEntries
};

exports.fetchData = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(configOptions, reporter, cache, contentTypeOption) {
    var syncData, entryService, _syncData, contentstackData;

    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            console.time('Fetch Contentstack data');
            console.log('Starting to fetch data from Contentstack');
            syncData = {};
            entryService = new OPTIONS_ENTRIES_CLASS_MAPPING[contentTypeOption]();
            _context8.next = 6;
            return entryService.fetchSyncData(configOptions, reporter, cache);

          case 6:
            _syncData = _context8.sent;
            syncData.data = _syncData.data;
            contentstackData = {
              syncData: syncData.data
            };
            console.timeEnd('Fetch Contentstack data');
            return _context8.abrupt("return", {
              contentstackData: contentstackData
            });

          case 11:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function (_x16, _x17, _x18, _x19) {
    return _ref.apply(this, arguments);
  };
}();

exports.fetchContentTypes = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(config, contentTypeOption) {
    var url, responseKey, contentType, allContentTypes;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            config.cdn = config.cdn ? config.cdn : 'https://cdn.contentstack.io/v3';
            url = 'content_types';
            responseKey = 'content_types';
            contentType = new OPTION_CLASS_MAPPING[contentTypeOption]();
            _context9.next = 6;
            return contentType.getPagedData(url, config, responseKey);

          case 6:
            allContentTypes = _context9.sent;
            return _context9.abrupt("return", allContentTypes);

          case 8:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));

  return function (_x20, _x21) {
    return _ref2.apply(this, arguments);
  };
}();

var _fetchSyncData2 = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10(query, config) {
    var url, response;
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            url = 'stacks/sync';
            _context10.next = 3;
            return getSyncData(url, config, query, 'items');

          case 3:
            response = _context10.sent;
            return _context10.abrupt("return", response);

          case 5:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));

  return function _fetchSyncData2(_x22, _x23) {
    return _ref3.apply(this, arguments);
  };
}();

var fetchCsData = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee11(url, config, query) {
    var queryParams, apiUrl, option;
    return _regenerator["default"].wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
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
            return _context11.abrupt("return", new Promise(function (resolve, reject) {
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
            return _context11.stop();
        }
      }
    }, _callee11);
  }));

  return function fetchCsData(_x24, _x25, _x26) {
    return _ref4.apply(this, arguments);
  };
}();

var _getPagedData2 = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee12(url, config, responseKey) {
    var query,
        skip,
        limit,
        aggregatedResponse,
        response,
        _args12 = arguments;
    return _regenerator["default"].wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            query = _args12.length > 3 && _args12[3] !== undefined ? _args12[3] : {};
            skip = _args12.length > 4 && _args12[4] !== undefined ? _args12[4] : 0;
            limit = _args12.length > 5 && _args12[5] !== undefined ? _args12[5] : 100;
            aggregatedResponse = _args12.length > 6 && _args12[6] !== undefined ? _args12[6] : null;
            query.skip = skip;
            query.limit = limit;
            query.include_global_field_schema = true;
            _context12.next = 9;
            return fetchCsData(url, config, query);

          case 9:
            response = _context12.sent;

            if (!aggregatedResponse) {
              aggregatedResponse = response[responseKey];
            } else {
              aggregatedResponse = aggregatedResponse.concat(response[responseKey]);
            }

            if (!(skip + limit <= response.count)) {
              _context12.next = 13;
              break;
            }

            return _context12.abrupt("return", _getPagedData2(url, config, responseKey, query = {}, skip + limit, limit, aggregatedResponse));

          case 13:
            return _context12.abrupt("return", aggregatedResponse);

          case 14:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12);
  }));

  return function _getPagedData2(_x27, _x28, _x29) {
    return _ref5.apply(this, arguments);
  };
}();

var getSyncData = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee13(url, config, query, responseKey) {
    var aggregatedResponse,
        response,
        _args13 = arguments;
    return _regenerator["default"].wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            aggregatedResponse = _args13.length > 4 && _args13[4] !== undefined ? _args13[4] : null;
            _context13.next = 3;
            return fetchCsData(url, config, query);

          case 3:
            response = _context13.sent;

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
              _context13.next = 7;
              break;
            }

            return _context13.abrupt("return", getSyncData(url, config, query = {
              pagination_token: response.pagination_token
            }, responseKey, aggregatedResponse));

          case 7:
            return _context13.abrupt("return", aggregatedResponse);

          case 8:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13);
  }));

  return function getSyncData(_x30, _x31, _x32, _x33) {
    return _ref6.apply(this, arguments);
  };
}();