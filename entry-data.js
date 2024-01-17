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
var FetchEntries = /*#__PURE__*/function () {
  function FetchEntries() {
    (0, _classCallCheck2["default"])(this, FetchEntries);
  }
  (0, _createClass2["default"])(FetchEntries, [{
    key: "fetchSyncData",
    value: function () {
      var _fetchSyncData = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
            case "end":
              return _context.stop();
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
      var _fetchSyncData2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(configOptions, cache, fn) {
        var typePrefix, syncData, entryTokenKey, assetTokenKey, _yield$Promise$all, _yield$Promise$all2, syncEntryToken, syncAssetToken, syncEntryParams, syncAssetParams, _yield$Promise$all3, _yield$Promise$all4, syncEntryData, syncAssetData, data, tokenKey, syncToken, syncParams;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
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
                init: true,
                limit: configOptions.limit > 100 ? 50 : configOptions.limit
              };
              syncAssetParams = syncAssetToken ? {
                sync_token: syncAssetToken
              } : {
                init: true,
                limit: configOptions.limit > 100 ? 50 : configOptions.limit
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
                init: true,
                limit: configOptions.limit > 100 ? 50 : configOptions.limit
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
              throw _context2.t0;
            case 43:
              return _context2.abrupt("return", syncData);
            case 44:
            case "end":
              return _context2.stop();
          }
        }, _callee2, null, [[2, 40]]);
      }));
      function fetchSyncData(_x, _x2, _x3) {
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
      var _fetchSyncData3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(configOptions, cache, fn) {
        var _yield$Promise$all5, _yield$Promise$all6, syncEntryData, syncAssetData, syncData;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              _context3.prev = 0;
              _context3.next = 3;
              return Promise.all([this.fetchEntries(configOptions, cache, fn), this.fetchAssets(configOptions, cache, fn)]);
            case 3:
              _yield$Promise$all5 = _context3.sent;
              _yield$Promise$all6 = (0, _slicedToArray2["default"])(_yield$Promise$all5, 2);
              syncEntryData = _yield$Promise$all6[0];
              syncAssetData = _yield$Promise$all6[1];
              syncData = {};
              syncData.data = syncEntryData.data.concat(syncAssetData.data);
              return _context3.abrupt("return", syncData);
            case 12:
              _context3.prev = 12;
              _context3.t0 = _context3["catch"](0);
              throw _context3.t0;
            case 15:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this, [[0, 12]]);
      }));
      function fetchSyncData(_x4, _x5, _x6) {
        return _fetchSyncData3.apply(this, arguments);
      }
      return fetchSyncData;
    }()
  }, {
    key: "fetchEntries",
    value: function () {
      var _fetchEntries = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(configOptions, cache, fn) {
        var syncData, typePrefix, contentTypes, i, contentType, tokenKey, syncToken, syncParams, _syncData;
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              syncData = {};
              typePrefix = configOptions.type_prefix || 'Contentstack';
              _context4.next = 5;
              return cache.get(typePrefix);
            case 5:
              contentTypes = _context4.sent;
              i = 0;
            case 7:
              if (!(i < contentTypes.length)) {
                _context4.next = 25;
                break;
              }
              contentType = contentTypes[i].uid;
              tokenKey = "".concat(typePrefix.toLowerCase(), "-sync-token-").concat(contentType, "-").concat(configOptions.api_key);
              _context4.next = 12;
              return cache.get(tokenKey);
            case 12:
              syncToken = _context4.sent;
              syncParams = syncToken ? {
                sync_token: syncToken
              } : {
                init: true
              };
              syncParams.content_type_uid = contentType;
              _context4.next = 17;
              return fn.apply(null, [syncParams, configOptions]);
            case 17:
              _syncData = _context4.sent;
              syncData.data = syncData.data || [];
              syncData.data = syncData.data.concat(_syncData.data);
              // Caching token for the next sync.
              _context4.next = 22;
              return cache.set(tokenKey, _syncData.sync_token);
            case 22:
              i++;
              _context4.next = 7;
              break;
            case 25:
              return _context4.abrupt("return", syncData);
            case 28:
              _context4.prev = 28;
              _context4.t0 = _context4["catch"](0);
              throw _context4.t0;
            case 31:
            case "end":
              return _context4.stop();
          }
        }, _callee4, null, [[0, 28]]);
      }));
      function fetchEntries(_x7, _x8, _x9) {
        return _fetchEntries.apply(this, arguments);
      }
      return fetchEntries;
    }()
  }, {
    key: "fetchAssets",
    value: function () {
      var _fetchAssets = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(configOptions, cache, fn) {
        var fetchAssetService, syncData;
        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              _context5.prev = 0;
              fetchAssetService = new FetchAssets();
              _context5.next = 4;
              return fetchAssetService.fetchAssets(configOptions, cache, fn);
            case 4:
              syncData = _context5.sent;
              return _context5.abrupt("return", syncData);
            case 8:
              _context5.prev = 8;
              _context5.t0 = _context5["catch"](0);
              throw _context5.t0;
            case 11:
            case "end":
              return _context5.stop();
          }
        }, _callee5, null, [[0, 8]]);
      }));
      function fetchAssets(_x10, _x11, _x12) {
        return _fetchAssets.apply(this, arguments);
      }
      return fetchAssets;
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
      var _fetchSyncData4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(configOptions, cache, fn) {
        var _yield$Promise$all7, _yield$Promise$all8, syncEntryData, syncAssetData, syncData;
        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return Promise.all([this.fetchEntries(configOptions, cache, fn), this.fetchAssets(configOptions, cache, fn)]);
            case 2:
              _yield$Promise$all7 = _context6.sent;
              _yield$Promise$all8 = (0, _slicedToArray2["default"])(_yield$Promise$all7, 2);
              syncEntryData = _yield$Promise$all8[0];
              syncAssetData = _yield$Promise$all8[1];
              syncData = {};
              syncData.data = syncEntryData.data.concat(syncAssetData.data);
              return _context6.abrupt("return", syncData);
            case 9:
            case "end":
              return _context6.stop();
          }
        }, _callee6, this);
      }));
      function fetchSyncData(_x13, _x14, _x15) {
        return _fetchSyncData4.apply(this, arguments);
      }
      return fetchSyncData;
    }()
  }, {
    key: "fetchEntries",
    value: function () {
      var _fetchEntries2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(configOptions, cache, fn) {
        var syncData, typePrefix, locales, i, locale, tokenKey, syncToken, syncParams, _syncData;
        return _regenerator["default"].wrap(function _callee7$(_context7) {
          while (1) switch (_context7.prev = _context7.next) {
            case 0:
              _context7.prev = 0;
              syncData = {};
              typePrefix = configOptions.type_prefix || 'Contentstack';
              locales = configOptions.locales;
              i = 0;
            case 5:
              if (!(i < locales.length)) {
                _context7.next = 23;
                break;
              }
              locale = locales[i];
              tokenKey = "".concat(typePrefix.toLowerCase(), "-sync-token-").concat(locale, "-").concat(configOptions.api_key);
              _context7.next = 10;
              return cache.get(tokenKey);
            case 10:
              syncToken = _context7.sent;
              syncParams = syncToken ? {
                sync_token: syncToken
              } : {
                init: true
              };
              syncParams.locale = locale;
              _context7.next = 15;
              return fn.apply(null, [syncParams, configOptions]);
            case 15:
              _syncData = _context7.sent;
              syncData.data = syncData.data || [];
              syncData.data = syncData.data.concat(_syncData.data);
              // Caching token for next sync
              _context7.next = 20;
              return cache.set(tokenKey, _syncData.sync_token);
            case 20:
              i++;
              _context7.next = 5;
              break;
            case 23:
              return _context7.abrupt("return", syncData);
            case 26:
              _context7.prev = 26;
              _context7.t0 = _context7["catch"](0);
              throw _context7.t0;
            case 29:
            case "end":
              return _context7.stop();
          }
        }, _callee7, null, [[0, 26]]);
      }));
      function fetchEntries(_x16, _x17, _x18) {
        return _fetchEntries2.apply(this, arguments);
      }
      return fetchEntries;
    }()
  }, {
    key: "fetchAssets",
    value: function () {
      var _fetchAssets2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(configOptions, cache, fn) {
        var fetchAssetService, syncData;
        return _regenerator["default"].wrap(function _callee8$(_context8) {
          while (1) switch (_context8.prev = _context8.next) {
            case 0:
              _context8.prev = 0;
              fetchAssetService = new FetchAssets();
              _context8.next = 4;
              return fetchAssetService.fetchAssets(configOptions, cache, fn);
            case 4:
              syncData = _context8.sent;
              return _context8.abrupt("return", syncData);
            case 8:
              _context8.prev = 8;
              _context8.t0 = _context8["catch"](0);
              throw _context8.t0;
            case 11:
            case "end":
              return _context8.stop();
          }
        }, _callee8, null, [[0, 8]]);
      }));
      function fetchAssets(_x19, _x20, _x21) {
        return _fetchAssets2.apply(this, arguments);
      }
      return fetchAssets;
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
      var _fetchSyncData5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(configOptions, cache, fn) {
        var _yield$Promise$all9, _yield$Promise$all10, syncEntryData, syncAssetData, syncData;
        return _regenerator["default"].wrap(function _callee9$(_context9) {
          while (1) switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return Promise.all([this.fetchEntries(configOptions, cache, fn), this.fetchAssets(configOptions, cache, fn)]);
            case 2:
              _yield$Promise$all9 = _context9.sent;
              _yield$Promise$all10 = (0, _slicedToArray2["default"])(_yield$Promise$all9, 2);
              syncEntryData = _yield$Promise$all10[0];
              syncAssetData = _yield$Promise$all10[1];
              syncData = {};
              syncData.data = syncEntryData.data.concat(syncAssetData.data);
              return _context9.abrupt("return", syncData);
            case 9:
            case "end":
              return _context9.stop();
          }
        }, _callee9, this);
      }));
      function fetchSyncData(_x22, _x23, _x24) {
        return _fetchSyncData5.apply(this, arguments);
      }
      return fetchSyncData;
    }()
  }, {
    key: "fetchEntries",
    value: function () {
      var _fetchEntries3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10(configOptions, cache, fn) {
        var syncData, typePrefix, contentTypes, locales, i, contentType, j, locale, tokenKey, syncToken, syncParams, _syncData;
        return _regenerator["default"].wrap(function _callee10$(_context10) {
          while (1) switch (_context10.prev = _context10.next) {
            case 0:
              _context10.prev = 0;
              syncData = {};
              typePrefix = configOptions.type_prefix || 'Contentstack';
              _context10.next = 5;
              return cache.get(typePrefix);
            case 5:
              contentTypes = _context10.sent;
              locales = configOptions.locales;
              i = 0;
            case 8:
              if (!(i < contentTypes.length)) {
                _context10.next = 33;
                break;
              }
              contentType = contentTypes[i].uid;
              j = 0;
            case 11:
              if (!(j < locales.length)) {
                _context10.next = 30;
                break;
              }
              locale = locales[j];
              tokenKey = "".concat(typePrefix.toLowerCase(), "-sync-token-").concat(contentType, "-").concat(locale, "-").concat(configOptions.api_key);
              _context10.next = 16;
              return cache.get(tokenKey);
            case 16:
              syncToken = _context10.sent;
              syncParams = syncToken ? {
                sync_token: syncToken
              } : {
                init: true
              };
              syncParams.content_type_uid = contentType;
              syncParams.locale = locale;
              _context10.next = 22;
              return fn.apply(null, [syncParams, configOptions]);
            case 22:
              _syncData = _context10.sent;
              syncData.data = syncData.data || [];
              syncData.data = syncData.data.concat(_syncData.data);
              // Caching token for next sync
              _context10.next = 27;
              return cache.set(tokenKey, _syncData.sync_token);
            case 27:
              j++;
              _context10.next = 11;
              break;
            case 30:
              i++;
              _context10.next = 8;
              break;
            case 33:
              return _context10.abrupt("return", syncData);
            case 36:
              _context10.prev = 36;
              _context10.t0 = _context10["catch"](0);
              throw _context10.t0;
            case 39:
            case "end":
              return _context10.stop();
          }
        }, _callee10, null, [[0, 36]]);
      }));
      function fetchEntries(_x25, _x26, _x27) {
        return _fetchEntries3.apply(this, arguments);
      }
      return fetchEntries;
    }()
  }, {
    key: "fetchAssets",
    value: function () {
      var _fetchAssets3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee11(configOptions, cache, fn) {
        var fetchAssetService, syncData;
        return _regenerator["default"].wrap(function _callee11$(_context11) {
          while (1) switch (_context11.prev = _context11.next) {
            case 0:
              _context11.prev = 0;
              fetchAssetService = new FetchAssets();
              _context11.next = 4;
              return fetchAssetService.fetchAssets(configOptions, cache, fn);
            case 4:
              syncData = _context11.sent;
              return _context11.abrupt("return", syncData);
            case 8:
              _context11.prev = 8;
              _context11.t0 = _context11["catch"](0);
              throw _context11.t0;
            case 11:
            case "end":
              return _context11.stop();
          }
        }, _callee11, null, [[0, 8]]);
      }));
      function fetchAssets(_x28, _x29, _x30) {
        return _fetchAssets3.apply(this, arguments);
      }
      return fetchAssets;
    }()
  }]);
  return FetchSpecifiedLocalesAndContentTypesEntries;
}(FetchEntries);
var FetchAssets = /*#__PURE__*/function () {
  function FetchAssets() {
    (0, _classCallCheck2["default"])(this, FetchAssets);
  }
  (0, _createClass2["default"])(FetchAssets, [{
    key: "fetchAssets",
    value: function () {
      var _fetchAssets4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee12(configOptions, cache, fn) {
        var typePrefix, syncData, assetTokenKey, syncAssetToken, syncAssetParams, syncAssetData;
        return _regenerator["default"].wrap(function _callee12$(_context12) {
          while (1) switch (_context12.prev = _context12.next) {
            case 0:
              typePrefix = configOptions.type_prefix || 'Contentstack';
              _context12.prev = 1;
              syncData = {};
              assetTokenKey = "".concat(typePrefix.toLowerCase(), "-sync-token-asset-").concat(configOptions.api_key);
              _context12.next = 6;
              return cache.get(assetTokenKey);
            case 6:
              syncAssetToken = _context12.sent;
              syncAssetParams = syncAssetToken ? {
                sync_token: syncAssetToken
              } : {
                init: true
              };
              syncAssetParams.type = 'asset_published,asset_unpublished,asset_deleted';
              _context12.next = 11;
              return fn.apply(null, [syncAssetParams, configOptions]);
            case 11:
              syncAssetData = _context12.sent;
              syncData.data = syncAssetData.data;
              _context12.next = 15;
              return cache.set(assetTokenKey, syncAssetData.sync_token);
            case 15:
              return _context12.abrupt("return", syncData);
            case 18:
              _context12.prev = 18;
              _context12.t0 = _context12["catch"](1);
              throw _context12.t0;
            case 21:
            case "end":
              return _context12.stop();
          }
        }, _callee12, null, [[1, 18]]);
      }));
      function fetchAssets(_x31, _x32, _x33) {
        return _fetchAssets4.apply(this, arguments);
      }
      return fetchAssets;
    }()
  }]);
  return FetchAssets;
}();
exports.FetchEntries = FetchEntries;
exports.FetchDefaultEntries = FetchDefaultEntries;
exports.FetchSpecifiedContentTypesEntries = FetchSpecifiedContentTypesEntries;
exports.FetchSpecifiedLocalesEntries = FetchSpecifiedLocalesEntries;
exports.FetchSpecifiedLocalesAndContentTypesEntries = FetchSpecifiedLocalesAndContentTypesEntries;
//# sourceMappingURL=entry-data.js.map