'use strict';

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

var _require = require('./utils'),
    CODES = _require.CODES;

var FetchEntries = /*#__PURE__*/function () {
  function FetchEntries() {
    (0, _classCallCheck2["default"])(this, FetchEntries);
  }

  (0, _createClass2["default"])(FetchEntries, [{
    key: "fetchSyncData",
    value: function () {
      var _fetchSyncData = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
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

  var _super = _createSuper(FetchDefaultEntries);

  function FetchDefaultEntries() {
    (0, _classCallCheck2["default"])(this, FetchDefaultEntries);
    return _super.apply(this, arguments);
  }

  (0, _createClass2["default"])(FetchDefaultEntries, [{
    key: "fetchSyncData",
    value: function () {
      var _fetchSyncData2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(configOptions, reporter, cache, fn) {
        var typePrefix, syncData, entryTokenKey, assetTokenKey, _yield$Promise$all, _yield$Promise$all2, syncEntryToken, syncAssetToken, syncEntryParams, syncAssetParams, _yield$Promise$all3, _yield$Promise$all4, syncEntryData, syncAssetData, data, tokenKey, syncToken, syncParams;

        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                typePrefix = configOptions.type_prefix || 'Contentstack';
                syncData = {};
                _context2.prev = 2;

                if (!configOptions.expediteBuild) {
                  _context2.next = 28;
                  break;
                }

                entryTokenKey = "".concat(typePrefix.toLowerCase(), "-sync-token-entry-").concat(configOptions.api_key);
                assetTokenKey = "".concat(typePrefix.toLowerCase(), "-sync-token-asset-").concat(configOptions.api_key);
                _context2.next = 8;
                return Promise.all([cache.get(entryTokenKey), cache.get(assetTokenKey)]);

              case 8:
                _yield$Promise$all = _context2.sent;
                _yield$Promise$all2 = (0, _slicedToArray2["default"])(_yield$Promise$all, 2);
                syncEntryToken = _yield$Promise$all2[0];
                syncAssetToken = _yield$Promise$all2[1];
                syncEntryParams = syncEntryToken ? {
                  sync_token: syncEntryToken
                } : {
                  init: true
                };
                syncAssetParams = syncAssetToken ? {
                  sync_token: syncAssetToken
                } : {
                  init: true
                };
                syncEntryParams.type = 'entry_published,entry_unpublished,entry_deleted';
                syncAssetParams.type = 'asset_published,asset_unpublished,asset_deleted';
                _context2.next = 18;
                return Promise.all([fn.apply(null, [syncEntryParams, configOptions]), fn.apply(null, [syncAssetParams, configOptions])]);

              case 18:
                _yield$Promise$all3 = _context2.sent;
                _yield$Promise$all4 = (0, _slicedToArray2["default"])(_yield$Promise$all3, 2);
                syncEntryData = _yield$Promise$all4[0];
                syncAssetData = _yield$Promise$all4[1];
                data = syncEntryData.data.concat(syncAssetData.data);
                syncData.data = data;
                _context2.next = 26;
                return Promise.all([cache.set(entryTokenKey, syncEntryData.sync_token), cache.set(assetTokenKey, syncAssetData.sync_token)]);

              case 26:
                _context2.next = 38;
                break;

              case 28:
                tokenKey = "".concat(typePrefix.toLowerCase(), "-sync-token-").concat(configOptions.api_key);
                _context2.next = 31;
                return cache.get(tokenKey);

              case 31:
                syncToken = _context2.sent;
                syncParams = syncToken ? {
                  sync_token: syncToken
                } : {
                  init: true
                };
                _context2.next = 35;
                return fn.apply(null, [syncParams, configOptions]);

              case 35:
                syncData = _context2.sent;
                _context2.next = 38;
                return cache.set(tokenKey, syncData.sync_token);

              case 38:
                _context2.next = 43;
                break;

              case 40:
                _context2.prev = 40;
                _context2.t0 = _context2["catch"](2);
                reporter.panic({
                  id: CODES.SyncError,
                  context: {
                    sourceMessage: "Fetching contentstack data failed [expediteBuild]. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help."
                  },
                  error: _context2.t0
                });

              case 43:
                return _context2.abrupt("return", syncData);

              case 44:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[2, 40]]);
      }));

      function fetchSyncData(_x, _x2, _x3, _x4) {
        return _fetchSyncData2.apply(this, arguments);
      }

      return fetchSyncData;
    }()
  }]);
  return FetchDefaultEntries;
}(FetchEntries);

var FetchSpecifiedContentTypesEntries = /*#__PURE__*/function (_FetchEntries2) {
  (0, _inherits2["default"])(FetchSpecifiedContentTypesEntries, _FetchEntries2);

  var _super2 = _createSuper(FetchSpecifiedContentTypesEntries);

  function FetchSpecifiedContentTypesEntries() {
    (0, _classCallCheck2["default"])(this, FetchSpecifiedContentTypesEntries);
    return _super2.apply(this, arguments);
  }

  (0, _createClass2["default"])(FetchSpecifiedContentTypesEntries, [{
    key: "fetchSyncData",
    value: function () {
      var _fetchSyncData3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(configOptions, reporter, cache, fn) {
        var typePrefix, contentTypes, syncData, i, contentType, tokenKey, syncToken, syncParams, _syncData;

        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                typePrefix = configOptions.type_prefix || 'Contentstack';
                _context3.next = 3;
                return cache.get(typePrefix);

              case 3:
                contentTypes = _context3.sent;
                syncData = {};
                _context3.prev = 5;
                i = 0;

              case 7:
                if (!(i < contentTypes.length)) {
                  _context3.next = 25;
                  break;
                }

                contentType = contentTypes[i].uid;
                tokenKey = "".concat(typePrefix.toLowerCase(), "-sync-token-").concat(contentType, "-").concat(configOptions.api_key);
                _context3.next = 12;
                return cache.get(tokenKey);

              case 12:
                syncToken = _context3.sent;
                syncParams = syncToken ? {
                  sync_token: syncToken
                } : {
                  init: true
                };
                syncParams.content_type_uid = contentType;
                _context3.next = 17;
                return fn.apply(null, [syncParams, configOptions]);

              case 17:
                _syncData = _context3.sent;
                syncData.data = syncData.data || [];
                syncData.data = syncData.data.concat(_syncData.data); // Caching token for the next sync.

                _context3.next = 22;
                return cache.set(tokenKey, _syncData.sync_token);

              case 22:
                i++;
                _context3.next = 7;
                break;

              case 25:
                _context3.next = 30;
                break;

              case 27:
                _context3.prev = 27;
                _context3.t0 = _context3["catch"](5);
                reporter.panic({
                  id: CODES.SyncError,
                  context: {
                    sourceMessage: "Fetching contentstack data failed. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help."
                  },
                  error: _context3.t0
                });

              case 30:
                return _context3.abrupt("return", syncData);

              case 31:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, null, [[5, 27]]);
      }));

      function fetchSyncData(_x5, _x6, _x7, _x8) {
        return _fetchSyncData3.apply(this, arguments);
      }

      return fetchSyncData;
    }()
  }]);
  return FetchSpecifiedContentTypesEntries;
}(FetchEntries);

var FetchSpecifiedLocalesEntries = /*#__PURE__*/function (_FetchEntries3) {
  (0, _inherits2["default"])(FetchSpecifiedLocalesEntries, _FetchEntries3);

  var _super3 = _createSuper(FetchSpecifiedLocalesEntries);

  function FetchSpecifiedLocalesEntries() {
    (0, _classCallCheck2["default"])(this, FetchSpecifiedLocalesEntries);
    return _super3.apply(this, arguments);
  }

  (0, _createClass2["default"])(FetchSpecifiedLocalesEntries, [{
    key: "fetchSyncData",
    value: function () {
      var _fetchSyncData4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(configOptions, reporter, cache, fn) {
        var typePrefix, locales, syncData, i, locale, tokenKey, syncToken, syncParams, _syncData;

        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                typePrefix = configOptions.type_prefix || 'Contentstack';
                locales = configOptions.locales;
                syncData = {};
                _context4.prev = 3;
                i = 0;

              case 5:
                if (!(i < locales.length)) {
                  _context4.next = 23;
                  break;
                }

                locale = locales[i];
                tokenKey = "".concat(typePrefix.toLowerCase(), "-sync-token-").concat(locale, "-").concat(configOptions.api_key);
                _context4.next = 10;
                return cache.get(tokenKey);

              case 10:
                syncToken = _context4.sent;
                syncParams = syncToken ? {
                  sync_token: syncToken
                } : {
                  init: true
                };
                syncParams.locale = locale;
                _context4.next = 15;
                return fn.apply(null, [syncParams, configOptions]);

              case 15:
                _syncData = _context4.sent;
                syncData.data = syncData.data || [];
                syncData.data = syncData.data.concat(_syncData.data); // Caching token for next sync

                _context4.next = 20;
                return cache.set(tokenKey, _syncData.sync_token);

              case 20:
                i++;
                _context4.next = 5;
                break;

              case 23:
                _context4.next = 28;
                break;

              case 25:
                _context4.prev = 25;
                _context4.t0 = _context4["catch"](3);
                reporter.panic({
                  id: CODES.SyncError,
                  context: {
                    sourceMessage: "Fetching contentstack data failed. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help."
                  },
                  error: _context4.t0
                });

              case 28:
                return _context4.abrupt("return", syncData);

              case 29:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, null, [[3, 25]]);
      }));

      function fetchSyncData(_x9, _x10, _x11, _x12) {
        return _fetchSyncData4.apply(this, arguments);
      }

      return fetchSyncData;
    }()
  }]);
  return FetchSpecifiedLocalesEntries;
}(FetchEntries);

var FetchSpecifiedLocalesAndContentTypesEntries = /*#__PURE__*/function (_FetchEntries4) {
  (0, _inherits2["default"])(FetchSpecifiedLocalesAndContentTypesEntries, _FetchEntries4);

  var _super4 = _createSuper(FetchSpecifiedLocalesAndContentTypesEntries);

  function FetchSpecifiedLocalesAndContentTypesEntries() {
    (0, _classCallCheck2["default"])(this, FetchSpecifiedLocalesAndContentTypesEntries);
    return _super4.apply(this, arguments);
  }

  (0, _createClass2["default"])(FetchSpecifiedLocalesAndContentTypesEntries, [{
    key: "fetchSyncData",
    value: function () {
      var _fetchSyncData5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(configOptions, reporter, cache, fn) {
        var typePrefix, contentTypes, locales, syncData, i, contentType, j, locale, tokenKey, syncToken, syncParams, _syncData;

        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                typePrefix = configOptions.type_prefix || 'Contentstack';
                _context5.next = 3;
                return cache.get(typePrefix);

              case 3:
                contentTypes = _context5.sent;
                locales = configOptions.locales;
                syncData = {};
                _context5.prev = 6;
                i = 0;

              case 8:
                if (!(i < contentTypes.length)) {
                  _context5.next = 33;
                  break;
                }

                contentType = contentTypes[i].uid;
                j = 0;

              case 11:
                if (!(j < locales.length)) {
                  _context5.next = 30;
                  break;
                }

                locale = locales[j];
                tokenKey = "".concat(typePrefix.toLowerCase(), "-sync-token-").concat(contentType, "-").concat(locale, "-").concat(configOptions.api_key);
                _context5.next = 16;
                return cache.get(tokenKey);

              case 16:
                syncToken = _context5.sent;
                syncParams = syncToken ? {
                  sync_token: syncToken
                } : {
                  init: true
                };
                syncParams.content_type_uid = contentType;
                syncParams.locale = locale;
                _context5.next = 22;
                return fn.apply(null, [syncParams, configOptions]);

              case 22:
                _syncData = _context5.sent;
                syncData.data = syncData.data || [];
                syncData.data = syncData.data.concat(_syncData.data); // Caching token for next sync

                _context5.next = 27;
                return cache.set(tokenKey, _syncData.sync_token);

              case 27:
                j++;
                _context5.next = 11;
                break;

              case 30:
                i++;
                _context5.next = 8;
                break;

              case 33:
                _context5.next = 38;
                break;

              case 35:
                _context5.prev = 35;
                _context5.t0 = _context5["catch"](6);
                reporter.panic({
                  id: CODES.SyncError,
                  context: {
                    sourceMessage: "Fetching contentstack data failed. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help."
                  },
                  error: _context5.t0
                });

              case 38:
                return _context5.abrupt("return", syncData);

              case 39:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, null, [[6, 35]]);
      }));

      function fetchSyncData(_x13, _x14, _x15, _x16) {
        return _fetchSyncData5.apply(this, arguments);
      }

      return fetchSyncData;
    }()
  }]);
  return FetchSpecifiedLocalesAndContentTypesEntries;
}(FetchEntries);

exports.FetchEntries = FetchEntries;
exports.FetchDefaultEntries = FetchDefaultEntries;
exports.FetchSpecifiedContentTypesEntries = FetchSpecifiedContentTypesEntries;
exports.FetchSpecifiedLocalesEntries = FetchSpecifiedLocalesEntries;
exports.FetchSpecifiedLocalesAndContentTypesEntries = FetchSpecifiedLocalesAndContentTypesEntries;