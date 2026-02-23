'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));
var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));
var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
function _callSuper(t, o, e) { return o = (0, _getPrototypeOf2["default"])(o), (0, _possibleConstructorReturn2["default"])(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOf2["default"])(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var FetchEntries = /*#__PURE__*/function () {
  function FetchEntries() {
    (0, _classCallCheck2["default"])(this, FetchEntries);
  }
  return (0, _createClass2["default"])(FetchEntries, [{
    key: "fetchSyncData",
    value: function () {
      var _fetchSyncData = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee() {
        return _regenerator["default"].wrap(function (_context) {
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
}();
var FetchDefaultEntries = /*#__PURE__*/function (_FetchEntries) {
  function FetchDefaultEntries() {
    (0, _classCallCheck2["default"])(this, FetchDefaultEntries);
    return _callSuper(this, FetchDefaultEntries, arguments);
  }
  (0, _inherits2["default"])(FetchDefaultEntries, _FetchEntries);
  return (0, _createClass2["default"])(FetchDefaultEntries, [{
    key: "fetchSyncData",
    value: function () {
      var _fetchSyncData2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(configOptions, cache, fn) {
        var typePrefix, syncData, entryTokenKey, assetTokenKey, _yield$Promise$all, _yield$Promise$all2, syncEntryToken, syncAssetToken, syncEntryParams, syncAssetParams, _yield$Promise$all3, _yield$Promise$all4, syncEntryData, syncAssetData, data, tokenKey, syncToken, syncParams, _t;
        return _regenerator["default"].wrap(function (_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              typePrefix = configOptions.type_prefix || 'Contentstack';
              syncData = {};
              _context2.prev = 1;
              if (!configOptions.expediteBuild) {
                _context2.next = 5;
                break;
              }
              entryTokenKey = "".concat(typePrefix.toLowerCase(), "-sync-token-entry-").concat(configOptions.api_key);
              assetTokenKey = "".concat(typePrefix.toLowerCase(), "-sync-token-asset-").concat(configOptions.api_key);
              _context2.next = 2;
              return Promise.all([cache.get(entryTokenKey), cache.get(assetTokenKey)]);
            case 2:
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
              _context2.next = 3;
              return Promise.all([fn.apply(null, [syncEntryParams, configOptions]), fn.apply(null, [syncAssetParams, configOptions])]);
            case 3:
              _yield$Promise$all3 = _context2.sent;
              _yield$Promise$all4 = (0, _slicedToArray2["default"])(_yield$Promise$all3, 2);
              syncEntryData = _yield$Promise$all4[0];
              syncAssetData = _yield$Promise$all4[1];
              data = syncEntryData.data.concat(syncAssetData.data);
              syncData.data = data;
              _context2.next = 4;
              return Promise.all([syncEntryData.sync_token !== undefined ? cache.set(entryTokenKey, syncEntryData.sync_token) : Promise.resolve(), syncAssetData.sync_token !== undefined ? cache.set(assetTokenKey, syncAssetData.sync_token) : Promise.resolve()]);
            case 4:
              _context2.next = 8;
              break;
            case 5:
              tokenKey = "".concat(typePrefix.toLowerCase(), "-sync-token-").concat(configOptions.api_key);
              _context2.next = 6;
              return cache.get(tokenKey);
            case 6:
              syncToken = _context2.sent;
              syncParams = syncToken ? {
                sync_token: syncToken
              } : {
                init: true,
                limit: configOptions.limit > 100 ? 50 : configOptions.limit
              };
              _context2.next = 7;
              return fn.apply(null, [syncParams, configOptions]);
            case 7:
              syncData = _context2.sent;
              if (!(syncData.sync_token !== undefined)) {
                _context2.next = 8;
                break;
              }
              _context2.next = 8;
              return cache.set(tokenKey, syncData.sync_token);
            case 8:
              _context2.next = 10;
              break;
            case 9:
              _context2.prev = 9;
              _t = _context2["catch"](1);
              throw _t;
            case 10:
              return _context2.abrupt("return", syncData);
            case 11:
            case "end":
              return _context2.stop();
          }
        }, _callee2, null, [[1, 9]]);
      }));
      function fetchSyncData(_x, _x2, _x3) {
        return _fetchSyncData2.apply(this, arguments);
      }
      return fetchSyncData;
    }()
  }]);
}(FetchEntries);
var FetchSpecifiedContentTypesEntries = /*#__PURE__*/function (_FetchEntries2) {
  function FetchSpecifiedContentTypesEntries() {
    (0, _classCallCheck2["default"])(this, FetchSpecifiedContentTypesEntries);
    return _callSuper(this, FetchSpecifiedContentTypesEntries, arguments);
  }
  (0, _inherits2["default"])(FetchSpecifiedContentTypesEntries, _FetchEntries2);
  return (0, _createClass2["default"])(FetchSpecifiedContentTypesEntries, [{
    key: "fetchSyncData",
    value: function () {
      var _fetchSyncData3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(configOptions, cache, fn) {
        var _yield$Promise$all5, _yield$Promise$all6, syncEntryData, syncAssetData, syncData, _t2;
        return _regenerator["default"].wrap(function (_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              _context3.prev = 0;
              _context3.next = 1;
              return Promise.all([this.fetchEntries(configOptions, cache, fn), this.fetchAssets(configOptions, cache, fn)]);
            case 1:
              _yield$Promise$all5 = _context3.sent;
              _yield$Promise$all6 = (0, _slicedToArray2["default"])(_yield$Promise$all5, 2);
              syncEntryData = _yield$Promise$all6[0];
              syncAssetData = _yield$Promise$all6[1];
              syncData = {};
              syncData.data = syncEntryData.data.concat(syncAssetData.data);
              return _context3.abrupt("return", syncData);
            case 2:
              _context3.prev = 2;
              _t2 = _context3["catch"](0);
              throw _t2;
            case 3:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this, [[0, 2]]);
      }));
      function fetchSyncData(_x4, _x5, _x6) {
        return _fetchSyncData3.apply(this, arguments);
      }
      return fetchSyncData;
    }()
  }, {
    key: "fetchEntries",
    value: function () {
      var _fetchEntries = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4(configOptions, cache, fn) {
        var syncData, typePrefix, contentTypes, i, contentType, tokenKey, syncToken, syncParams, _syncData, _t3;
        return _regenerator["default"].wrap(function (_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              syncData = {};
              typePrefix = configOptions.type_prefix || 'Contentstack';
              _context4.next = 1;
              return cache.get(typePrefix);
            case 1:
              contentTypes = _context4.sent;
              i = 0;
            case 2:
              if (!(i < contentTypes.length)) {
                _context4.next = 6;
                break;
              }
              contentType = contentTypes[i].uid;
              tokenKey = "".concat(typePrefix.toLowerCase(), "-sync-token-").concat(contentType, "-").concat(configOptions.api_key);
              _context4.next = 3;
              return cache.get(tokenKey);
            case 3:
              syncToken = _context4.sent;
              syncParams = syncToken ? {
                sync_token: syncToken
              } : {
                init: true
              };
              syncParams.content_type_uid = contentType;
              _context4.next = 4;
              return fn.apply(null, [syncParams, configOptions]);
            case 4:
              _syncData = _context4.sent;
              syncData.data = syncData.data || [];
              syncData.data = syncData.data.concat(_syncData.data);
              // Caching token for the next sync.
              if (!(_syncData.sync_token !== undefined)) {
                _context4.next = 5;
                break;
              }
              _context4.next = 5;
              return cache.set(tokenKey, _syncData.sync_token);
            case 5:
              i++;
              _context4.next = 2;
              break;
            case 6:
              return _context4.abrupt("return", syncData);
            case 7:
              _context4.prev = 7;
              _t3 = _context4["catch"](0);
              throw _t3;
            case 8:
            case "end":
              return _context4.stop();
          }
        }, _callee4, null, [[0, 7]]);
      }));
      function fetchEntries(_x7, _x8, _x9) {
        return _fetchEntries.apply(this, arguments);
      }
      return fetchEntries;
    }()
  }, {
    key: "fetchAssets",
    value: function () {
      var _fetchAssets = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(configOptions, cache, fn) {
        var fetchAssetService, syncData, _t4;
        return _regenerator["default"].wrap(function (_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              _context5.prev = 0;
              fetchAssetService = new FetchAssets();
              _context5.next = 1;
              return fetchAssetService.fetchAssets(configOptions, cache, fn);
            case 1:
              syncData = _context5.sent;
              return _context5.abrupt("return", syncData);
            case 2:
              _context5.prev = 2;
              _t4 = _context5["catch"](0);
              throw _t4;
            case 3:
            case "end":
              return _context5.stop();
          }
        }, _callee5, null, [[0, 2]]);
      }));
      function fetchAssets(_x0, _x1, _x10) {
        return _fetchAssets.apply(this, arguments);
      }
      return fetchAssets;
    }()
  }]);
}(FetchEntries);
var FetchSpecifiedLocalesEntries = /*#__PURE__*/function (_FetchEntries3) {
  function FetchSpecifiedLocalesEntries() {
    (0, _classCallCheck2["default"])(this, FetchSpecifiedLocalesEntries);
    return _callSuper(this, FetchSpecifiedLocalesEntries, arguments);
  }
  (0, _inherits2["default"])(FetchSpecifiedLocalesEntries, _FetchEntries3);
  return (0, _createClass2["default"])(FetchSpecifiedLocalesEntries, [{
    key: "fetchSyncData",
    value: function () {
      var _fetchSyncData4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee6(configOptions, cache, fn) {
        var _yield$Promise$all7, _yield$Promise$all8, syncEntryData, syncAssetData, syncData;
        return _regenerator["default"].wrap(function (_context6) {
          while (1) switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 1;
              return Promise.all([this.fetchEntries(configOptions, cache, fn), this.fetchAssets(configOptions, cache, fn)]);
            case 1:
              _yield$Promise$all7 = _context6.sent;
              _yield$Promise$all8 = (0, _slicedToArray2["default"])(_yield$Promise$all7, 2);
              syncEntryData = _yield$Promise$all8[0];
              syncAssetData = _yield$Promise$all8[1];
              syncData = {};
              syncData.data = syncEntryData.data.concat(syncAssetData.data);
              return _context6.abrupt("return", syncData);
            case 2:
            case "end":
              return _context6.stop();
          }
        }, _callee6, this);
      }));
      function fetchSyncData(_x11, _x12, _x13) {
        return _fetchSyncData4.apply(this, arguments);
      }
      return fetchSyncData;
    }()
  }, {
    key: "fetchEntries",
    value: function () {
      var _fetchEntries2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee7(configOptions, cache, fn) {
        var syncData, typePrefix, locales, i, locale, tokenKey, syncToken, syncParams, _syncData, _t5;
        return _regenerator["default"].wrap(function (_context7) {
          while (1) switch (_context7.prev = _context7.next) {
            case 0:
              _context7.prev = 0;
              syncData = {};
              typePrefix = configOptions.type_prefix || 'Contentstack';
              locales = configOptions.locales;
              i = 0;
            case 1:
              if (!(i < locales.length)) {
                _context7.next = 5;
                break;
              }
              locale = locales[i];
              tokenKey = "".concat(typePrefix.toLowerCase(), "-sync-token-").concat(locale, "-").concat(configOptions.api_key);
              _context7.next = 2;
              return cache.get(tokenKey);
            case 2:
              syncToken = _context7.sent;
              syncParams = syncToken ? {
                sync_token: syncToken
              } : {
                init: true
              };
              syncParams.locale = locale;
              _context7.next = 3;
              return fn.apply(null, [syncParams, configOptions]);
            case 3:
              _syncData = _context7.sent;
              syncData.data = syncData.data || [];
              syncData.data = syncData.data.concat(_syncData.data);
              // Caching token for next sync
              if (!(_syncData.sync_token !== undefined)) {
                _context7.next = 4;
                break;
              }
              _context7.next = 4;
              return cache.set(tokenKey, _syncData.sync_token);
            case 4:
              i++;
              _context7.next = 1;
              break;
            case 5:
              return _context7.abrupt("return", syncData);
            case 6:
              _context7.prev = 6;
              _t5 = _context7["catch"](0);
              throw _t5;
            case 7:
            case "end":
              return _context7.stop();
          }
        }, _callee7, null, [[0, 6]]);
      }));
      function fetchEntries(_x14, _x15, _x16) {
        return _fetchEntries2.apply(this, arguments);
      }
      return fetchEntries;
    }()
  }, {
    key: "fetchAssets",
    value: function () {
      var _fetchAssets2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee8(configOptions, cache, fn) {
        var fetchAssetService, syncData, _t6;
        return _regenerator["default"].wrap(function (_context8) {
          while (1) switch (_context8.prev = _context8.next) {
            case 0:
              _context8.prev = 0;
              fetchAssetService = new FetchAssets();
              _context8.next = 1;
              return fetchAssetService.fetchAssets(configOptions, cache, fn);
            case 1:
              syncData = _context8.sent;
              return _context8.abrupt("return", syncData);
            case 2:
              _context8.prev = 2;
              _t6 = _context8["catch"](0);
              throw _t6;
            case 3:
            case "end":
              return _context8.stop();
          }
        }, _callee8, null, [[0, 2]]);
      }));
      function fetchAssets(_x17, _x18, _x19) {
        return _fetchAssets2.apply(this, arguments);
      }
      return fetchAssets;
    }()
  }]);
}(FetchEntries);
var FetchSpecifiedLocalesAndContentTypesEntries = /*#__PURE__*/function (_FetchEntries4) {
  function FetchSpecifiedLocalesAndContentTypesEntries() {
    (0, _classCallCheck2["default"])(this, FetchSpecifiedLocalesAndContentTypesEntries);
    return _callSuper(this, FetchSpecifiedLocalesAndContentTypesEntries, arguments);
  }
  (0, _inherits2["default"])(FetchSpecifiedLocalesAndContentTypesEntries, _FetchEntries4);
  return (0, _createClass2["default"])(FetchSpecifiedLocalesAndContentTypesEntries, [{
    key: "fetchSyncData",
    value: function () {
      var _fetchSyncData5 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee9(configOptions, cache, fn) {
        var _yield$Promise$all9, _yield$Promise$all0, syncEntryData, syncAssetData, syncData;
        return _regenerator["default"].wrap(function (_context9) {
          while (1) switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 1;
              return Promise.all([this.fetchEntries(configOptions, cache, fn), this.fetchAssets(configOptions, cache, fn)]);
            case 1:
              _yield$Promise$all9 = _context9.sent;
              _yield$Promise$all0 = (0, _slicedToArray2["default"])(_yield$Promise$all9, 2);
              syncEntryData = _yield$Promise$all0[0];
              syncAssetData = _yield$Promise$all0[1];
              syncData = {};
              syncData.data = syncEntryData.data.concat(syncAssetData.data);
              return _context9.abrupt("return", syncData);
            case 2:
            case "end":
              return _context9.stop();
          }
        }, _callee9, this);
      }));
      function fetchSyncData(_x20, _x21, _x22) {
        return _fetchSyncData5.apply(this, arguments);
      }
      return fetchSyncData;
    }()
  }, {
    key: "fetchEntries",
    value: function () {
      var _fetchEntries3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee0(configOptions, cache, fn) {
        var syncData, typePrefix, contentTypes, locales, i, contentType, j, locale, tokenKey, syncToken, syncParams, _syncData, _t7;
        return _regenerator["default"].wrap(function (_context0) {
          while (1) switch (_context0.prev = _context0.next) {
            case 0:
              _context0.prev = 0;
              syncData = {};
              typePrefix = configOptions.type_prefix || 'Contentstack';
              _context0.next = 1;
              return cache.get(typePrefix);
            case 1:
              contentTypes = _context0.sent;
              locales = configOptions.locales;
              i = 0;
            case 2:
              if (!(i < contentTypes.length)) {
                _context0.next = 8;
                break;
              }
              contentType = contentTypes[i].uid;
              j = 0;
            case 3:
              if (!(j < locales.length)) {
                _context0.next = 7;
                break;
              }
              locale = locales[j];
              tokenKey = "".concat(typePrefix.toLowerCase(), "-sync-token-").concat(contentType, "-").concat(locale, "-").concat(configOptions.api_key);
              _context0.next = 4;
              return cache.get(tokenKey);
            case 4:
              syncToken = _context0.sent;
              syncParams = syncToken ? {
                sync_token: syncToken
              } : {
                init: true
              };
              syncParams.content_type_uid = contentType;
              syncParams.locale = locale;
              _context0.next = 5;
              return fn.apply(null, [syncParams, configOptions]);
            case 5:
              _syncData = _context0.sent;
              syncData.data = syncData.data || [];
              syncData.data = syncData.data.concat(_syncData.data);
              // Caching token for next sync
              if (!(_syncData.sync_token !== undefined)) {
                _context0.next = 6;
                break;
              }
              _context0.next = 6;
              return cache.set(tokenKey, _syncData.sync_token);
            case 6:
              j++;
              _context0.next = 3;
              break;
            case 7:
              i++;
              _context0.next = 2;
              break;
            case 8:
              return _context0.abrupt("return", syncData);
            case 9:
              _context0.prev = 9;
              _t7 = _context0["catch"](0);
              throw _t7;
            case 10:
            case "end":
              return _context0.stop();
          }
        }, _callee0, null, [[0, 9]]);
      }));
      function fetchEntries(_x23, _x24, _x25) {
        return _fetchEntries3.apply(this, arguments);
      }
      return fetchEntries;
    }()
  }, {
    key: "fetchAssets",
    value: function () {
      var _fetchAssets3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee1(configOptions, cache, fn) {
        var fetchAssetService, syncData, _t8;
        return _regenerator["default"].wrap(function (_context1) {
          while (1) switch (_context1.prev = _context1.next) {
            case 0:
              _context1.prev = 0;
              fetchAssetService = new FetchAssets();
              _context1.next = 1;
              return fetchAssetService.fetchAssets(configOptions, cache, fn);
            case 1:
              syncData = _context1.sent;
              return _context1.abrupt("return", syncData);
            case 2:
              _context1.prev = 2;
              _t8 = _context1["catch"](0);
              throw _t8;
            case 3:
            case "end":
              return _context1.stop();
          }
        }, _callee1, null, [[0, 2]]);
      }));
      function fetchAssets(_x26, _x27, _x28) {
        return _fetchAssets3.apply(this, arguments);
      }
      return fetchAssets;
    }()
  }]);
}(FetchEntries);
var FetchAssets = /*#__PURE__*/function () {
  function FetchAssets() {
    (0, _classCallCheck2["default"])(this, FetchAssets);
  }
  return (0, _createClass2["default"])(FetchAssets, [{
    key: "fetchAssets",
    value: function () {
      var _fetchAssets4 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee10(configOptions, cache, fn) {
        var typePrefix, syncData, assetTokenKey, syncAssetToken, syncAssetParams, syncAssetData, _t9;
        return _regenerator["default"].wrap(function (_context10) {
          while (1) switch (_context10.prev = _context10.next) {
            case 0:
              typePrefix = configOptions.type_prefix || 'Contentstack';
              _context10.prev = 1;
              syncData = {};
              assetTokenKey = "".concat(typePrefix.toLowerCase(), "-sync-token-asset-").concat(configOptions.api_key);
              _context10.next = 2;
              return cache.get(assetTokenKey);
            case 2:
              syncAssetToken = _context10.sent;
              syncAssetParams = syncAssetToken ? {
                sync_token: syncAssetToken
              } : {
                init: true
              };
              syncAssetParams.type = 'asset_published,asset_unpublished,asset_deleted';
              _context10.next = 3;
              return fn.apply(null, [syncAssetParams, configOptions]);
            case 3:
              syncAssetData = _context10.sent;
              syncData.data = syncAssetData.data;
              if (!(syncAssetData.sync_token !== undefined)) {
                _context10.next = 4;
                break;
              }
              _context10.next = 4;
              return cache.set(assetTokenKey, syncAssetData.sync_token);
            case 4:
              return _context10.abrupt("return", syncData);
            case 5:
              _context10.prev = 5;
              _t9 = _context10["catch"](1);
              throw _t9;
            case 6:
            case "end":
              return _context10.stop();
          }
        }, _callee10, null, [[1, 5]]);
      }));
      function fetchAssets(_x29, _x30, _x31) {
        return _fetchAssets4.apply(this, arguments);
      }
      return fetchAssets;
    }()
  }]);
}();
exports.FetchEntries = FetchEntries;
exports.FetchDefaultEntries = FetchDefaultEntries;
exports.FetchSpecifiedContentTypesEntries = FetchSpecifiedContentTypesEntries;
exports.FetchSpecifiedLocalesEntries = FetchSpecifiedLocalesEntries;
exports.FetchSpecifiedLocalesAndContentTypesEntries = FetchSpecifiedLocalesAndContentTypesEntries;
//# sourceMappingURL=entry-data.js.map