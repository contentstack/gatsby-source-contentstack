"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ContentstackGatsby = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _contentstack = _interopRequireDefault(require("contentstack"));
var _utils = require("@contentstack/utils");
var _lodash = _interopRequireDefault(require("lodash.isempty"));
var _lodash2 = _interopRequireDefault(require("lodash.clonedeep"));
var _storageHelper = require("./storage-helper");
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
// max depth for nested references
var MAX_DEPTH_ALLOWED = 5;
var ContentstackGatsby = exports.ContentstackGatsby = /*#__PURE__*/function () {
  function ContentstackGatsby(config) {
    (0, _classCallCheck2["default"])(this, ContentstackGatsby);
    (0, _defineProperty2["default"])(this, "config", void 0);
    (0, _defineProperty2["default"])(this, "stackSdk", void 0);
    (0, _defineProperty2["default"])(this, "contentTypes", void 0);
    (0, _defineProperty2["default"])(this, "referenceFields", void 0);
    (0, _defineProperty2["default"])(this, "referenceFieldPaths", void 0);
    this.config = config;
    this.livePreviewConfig = {
      hash: "",
      content_type_uid: "",
      entry_uid: ""
    };
    var stackConfig = _objectSpread(_objectSpread(_objectSpread({
      api_key: config.api_key,
      delivery_token: config.delivery_token,
      environment: config.environment
    }, config.region && {
      region: config.region
    }), config.branch && {
      branch: config.branch
    }), {}, {
      live_preview: {
        host: config.live_preview.preview_host,
        preview_token: config.live_preview.preview_token,
        enable: config.live_preview.enable
      }
    });
    this.stackSdk = _contentstack["default"].Stack(stackConfig);
    // reference fields in various CTs and the CTs they refer
    this.referenceFieldsStorage = new _storageHelper.Storage(window.sessionStorage, 'reference_fields');
    this.referenceFields = this.referenceFieldsStorage.get();
    this.statusStorage = new _storageHelper.Storage(window.sessionStorage, "status");

    // json rte fields in various CTs
    this.jsonRteFieldsStorage = new _storageHelper.Storage(window.sessionStorage, 'json_rte_fields');
    this.jsonRteFields = this.jsonRteFieldsStorage.get();

    // only field paths extracted from the above map for current CT
    this.referenceFieldPaths = [];

    // store content types in LP site's session storage
    this.contentTypesStorage = new _storageHelper.Storage(window.sessionStorage, 'content_types');
    this.contentTypes = this.contentTypesStorage.get();
  }
  return (0, _createClass2["default"])(ContentstackGatsby, [{
    key: "setHost",
    value: function setHost(host) {
      this.stackSdk.setHost(host);
    }

    /**
     * @deprecated With the `cslp__meta` query field, this should not be required
     * @param {Object.<string, any>} entry 
     */
  }, {
    key: "fetchContentTypes",
    value: function () {
      var _fetchContentTypes = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(uids) {
        var result, contentTypes;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return this.stackSdk.getContentTypes({
                query: {
                  uid: {
                    $in: uids
                  }
                },
                include_global_field_schema: true
              });
            case 3:
              result = _context.sent;
              if (!result) {
                _context.next = 8;
                break;
              }
              contentTypes = {};
              result.content_types.forEach(function (ct) {
                contentTypes[ct.uid] = ct;
              });
              return _context.abrupt("return", contentTypes);
            case 8:
              _context.next = 14;
              break;
            case 10:
              _context.prev = 10;
              _context.t0 = _context["catch"](0);
              console.error("Contentstack Gatsby (Live Preview): failed to fetch content types");
              throw _context.t0;
            case 14:
            case "end":
              return _context.stop();
          }
        }, _callee, this, [[0, 10]]);
      }));
      function fetchContentTypes(_x) {
        return _fetchContentTypes.apply(this, arguments);
      }
      return fetchContentTypes;
    }()
  }, {
    key: "getContentTypes",
    value: function () {
      var _getContentTypes = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(uids) {
        var _this = this;
        var uidsToFetch, types;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              // fetch and filter only content types that are not available in cache
              uidsToFetch = uids.filter(function (uid) {
                return !_this.contentTypes[uid];
              });
              if (uidsToFetch.length) {
                _context2.next = 3;
                break;
              }
              return _context2.abrupt("return", this.contentTypes);
            case 3:
              _context2.next = 5;
              return this.fetchContentTypes(uidsToFetch);
            case 5:
              types = _context2.sent;
              uidsToFetch.forEach(function (uid) {
                // TODO need to set it in two places, can be better
                _this.contentTypes[uid] = types[uid];
                _this.contentTypesStorage.set(uid, types[uid]);
              });
              return _context2.abrupt("return", this.contentTypes);
            case 8:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function getContentTypes(_x2) {
        return _getContentTypes.apply(this, arguments);
      }
      return getContentTypes;
    }()
  }, {
    key: "extractReferences",
    value: function () {
      var _extractReferences = (0, _asyncToGenerator2["default"])(function () {
        var _this2 = this;
        var refPathMap = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var status = arguments.length > 1 ? arguments[1] : undefined;
        var jsonRtePaths = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
        var depth = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : MAX_DEPTH_ALLOWED;
        var seen = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];
        return /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
          var uids, contentTypes, refPathsCount, explorePaths, _iterator, _step, _step$value, refPath, refUids, _iterator2, _step2, uid, rPath;
          return _regenerator["default"].wrap(function _callee3$(_context3) {
            while (1) switch (_context3.prev = _context3.next) {
              case 0:
                if (!(depth <= 0)) {
                  _context3.next = 2;
                  break;
                }
                return _context3.abrupt("return", refPathMap);
              case 2:
                uids = (0, _toConsumableArray2["default"])(new Set(Object.values(refPathMap).flat()));
                _context3.next = 5;
                return _this2.getContentTypes(uids);
              case 5:
                contentTypes = _context3.sent;
                refPathsCount = Object.keys(refPathMap).length;
                explorePaths = Object.entries(refPathMap).filter(function (_ref) {
                  var _ref2 = (0, _slicedToArray2["default"])(_ref, 1),
                    path = _ref2[0];
                  return !seen.includes(path);
                });
                _iterator = _createForOfIteratorHelper(explorePaths);
                try {
                  for (_iterator.s(); !(_step = _iterator.n()).done;) {
                    _step$value = (0, _slicedToArray2["default"])(_step.value, 2), refPath = _step$value[0], refUids = _step$value[1];
                    // mark this reference path as seen
                    seen.push(refPath);
                    _iterator2 = _createForOfIteratorHelper(refUids);
                    try {
                      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                        uid = _step2.value;
                        rPath = refPath.split('.'); // when path is root, set path to []
                        if (refPath === '') {
                          rPath = [];
                        }
                        if (!status.hasLivePreviewEntryFound) {
                          status.hasLivePreviewEntryFound = _this2.isCurrentEntryEdited(uid);
                        }
                        _this2.extractUids(contentTypes[uid].schema, rPath, refPathMap, jsonRtePaths);
                      }
                    } catch (err) {
                      _iterator2.e(err);
                    } finally {
                      _iterator2.f();
                    }
                  }
                } catch (err) {
                  _iterator.e(err);
                } finally {
                  _iterator.f();
                }
                if (!(Object.keys(refPathMap).length > refPathsCount)) {
                  _context3.next = 13;
                  break;
                }
                _context3.next = 13;
                return _this2.extractReferences(refPathMap, status, jsonRtePaths, depth - 1, seen);
              case 13:
                return _context3.abrupt("return", {
                  refPathMap: refPathMap,
                  jsonRtePaths: jsonRtePaths
                });
              case 14:
              case "end":
                return _context3.stop();
            }
          }, _callee3);
        })();
      });
      function extractReferences() {
        return _extractReferences.apply(this, arguments);
      }
      return extractReferences;
    }()
  }, {
    key: "extractUids",
    value: function extractUids(schema) {
      var pathPrefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var refPathMap = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var jsonRtePaths = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
      var referredUids = [];
      var _iterator3 = _createForOfIteratorHelper(schema),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _field$field_metadata;
          var field = _step3.value;
          var fieldPath = [].concat((0, _toConsumableArray2["default"])(pathPrefix), [field.uid]);
          if (field.data_type === 'reference' && Array.isArray(field.reference_to) && field.reference_to.length > 0) {
            referredUids.push.apply(referredUids, (0, _toConsumableArray2["default"])(field.reference_to));
            refPathMap[fieldPath.join('.')] = field.reference_to;
          } else if (field.data_type === 'blocks' && field.blocks && field.blocks.length > 0) {
            var _iterator4 = _createForOfIteratorHelper(field.blocks),
              _step4;
            try {
              for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                var block = _step4.value;
                var _this$extractUids = this.extractUids(block.schema, [].concat((0, _toConsumableArray2["default"])(fieldPath), [block.uid]), refPathMap, jsonRtePaths),
                  blockRefUids = _this$extractUids.referredUids;
                referredUids.push.apply(referredUids, (0, _toConsumableArray2["default"])(blockRefUids));
              }
            } catch (err) {
              _iterator4.e(err);
            } finally {
              _iterator4.f();
            }
          } else if (field.data_type === 'group' && field.schema && field.schema.length > 0) {
            var _this$extractUids2 = this.extractUids(field.schema, (0, _toConsumableArray2["default"])(fieldPath), refPathMap, jsonRtePaths),
              groupRefUids = _this$extractUids2.referredUids;
            referredUids.push.apply(referredUids, (0, _toConsumableArray2["default"])(groupRefUids));
          } else if (field.data_type === 'json' && (_field$field_metadata = field.field_metadata) !== null && _field$field_metadata !== void 0 && _field$field_metadata.allow_json_rte) {
            var rtePath = [].concat((0, _toConsumableArray2["default"])(pathPrefix), [field.uid]).join('.');
            jsonRtePaths.push(rtePath);
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      return {
        referredUids: referredUids,
        refPathMap: refPathMap
      };
    }

    /**
    * Identify reference paths in user-provided data
    * @param {any} data - entry data
    * @param {string[]} currentPath - traversal path
    * @param {string[]} referenceFieldPaths - content type reference paths
    */
  }, {
    key: "identifyReferences",
    value: function identifyReferences(data) {
      var _this3 = this;
      var currentPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var referenceFieldPaths = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
      var paths = [];
      var _loop = function _loop() {
        var _Object$entries$_i = (0, _slicedToArray2["default"])(_Object$entries[_i], 2),
          k = _Object$entries$_i[0],
          v = _Object$entries$_i[1];
        if (!v) {
          return 1; // continue
        }
        if (currentPath.length > 0) {
          var refPath = currentPath.join('.');
          // if a reference path and not already collected, collect it
          if (referenceFieldPaths.includes(refPath) && !paths.includes(refPath)) {
            paths.push(refPath);
          }
        }
        if (_this3.isNested(v)) {
          var tempPath = (0, _toConsumableArray2["default"])(currentPath);
          tempPath.push(k);
          var p = _this3.identifyReferences(v, tempPath, referenceFieldPaths);
          paths.push.apply(paths, (0, _toConsumableArray2["default"])(p));
        } else if (Array.isArray(v)) {
          var _tempPath = (0, _toConsumableArray2["default"])(currentPath);
          _tempPath.push(k);
          if (v.length > 0) {
            // need to go over all refs since each of them could be of different
            // content type and might contain refs
            var _iterator5 = _createForOfIteratorHelper(v),
              _step5;
            try {
              for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                var val = _step5.value;
                var _p = _this3.identifyReferences(val, _tempPath, referenceFieldPaths);
                paths.push.apply(paths, (0, _toConsumableArray2["default"])(_p));
              }
            } catch (err) {
              _iterator5.e(err);
            } finally {
              _iterator5.f();
            }
          }
          // no multiple ref present, Gatsby value -> [] (empty array)
          // no single ref present, Gatsby value -> []
          else if (v.length === 0 && referenceFieldPaths.includes(_tempPath.join('.'))) {
            // it is a single or multiple ref
            // also no idea what child references the user must be querying
            // so need to get all child refs
            paths.push(_tempPath.join('.'));
            var childRefPaths = referenceFieldPaths.filter(function (path) {
              return path.startsWith(_tempPath);
            });
            paths.push.apply(paths, (0, _toConsumableArray2["default"])(childRefPaths));
          }
        }
      };
      for (var _i = 0, _Object$entries = Object.entries(data); _i < _Object$entries.length; _i++) {
        if (_loop()) continue;
      }
      return (0, _toConsumableArray2["default"])(new Set(paths));
    }
  }, {
    key: "isCurrentEntryEdited",
    value: function isCurrentEntryEdited(entryContentType) {
      var _this$livePreviewConf;
      return entryContentType === ((_this$livePreviewConf = this.livePreviewConfig) === null || _this$livePreviewConf === void 0 ? void 0 : _this$livePreviewConf.content_type_uid);
    }
  }, {
    key: "fetchEntry",
    value: function () {
      var _fetchEntry = (0, _asyncToGenerator2["default"])(function (entryUid, contentTypeUid) {
        var _this4 = this;
        var referencePaths = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
        var jsonRtePaths = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
        return /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
          var entry;
          return _regenerator["default"].wrap(function _callee4$(_context4) {
            while (1) switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return _this4.stackSdk.ContentType(contentTypeUid).Entry(entryUid).includeReference(referencePaths).toJSON().fetch();
              case 2:
                entry = _context4.sent;
                if ((0, _lodash["default"])(entry)) {
                  _context4.next = 6;
                  break;
                }
                if (_this4.config.jsonRteToHtml) {
                  (0, _utils.jsonToHTML)({
                    entry: entry,
                    paths: jsonRtePaths
                  });
                }
                return _context4.abrupt("return", entry);
              case 6:
              case "end":
                return _context4.stop();
            }
          }, _callee4);
        })();
      });
      function fetchEntry(_x3, _x4) {
        return _fetchEntry.apply(this, arguments);
      }
      return fetchEntry;
    }()
  }, {
    key: "isNested",
    value: function isNested(value) {
      if ((0, _typeof2["default"])(value) === 'object' && !Array.isArray(value) && value !== null) {
        return true;
      }
      return false;
    }
  }, {
    key: "unwrapEntryData",
    value: function unwrapEntryData(data) {
      var values = Object.values(data);
      if (!values) {
        return data;
      }
      if (values && values.length === 1) {
        return values[0];
      }
      return values;
    }
  }, {
    key: "getUsingTypeName",
    value: function () {
      var _getUsingTypeName = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee5(data) {
        var _this$statusStorage$g, _this$jsonRteFields$c;
        var receivedData, live_preview, status, contentTypeUid, entryUid, _yield$this$extractRe, refPathMap, jsonRtePaths, referencePaths, paths, entry;
        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              receivedData = (0, _lodash2["default"])(data);
              live_preview = this.stackSdk.live_preview;
              status = {
                hasLivePreviewEntryFound: false
              };
              this.livePreviewConfig = live_preview;
              contentTypeUid = receivedData.__typename.split("_").slice(1).join("_");
              entryUid = receivedData.uid;
              status = (_this$statusStorage$g = this.statusStorage.get(contentTypeUid)) !== null && _this$statusStorage$g !== void 0 ? _this$statusStorage$g : {
                hasLivePreviewEntryFound: this.isCurrentEntryEdited(contentTypeUid)
              };
              if (!((0, _lodash["default"])(this.referenceFields[contentTypeUid]) || (0, _lodash["default"])(this.jsonRteFields[contentTypeUid]))) {
                _context5.next = 25;
                break;
              }
              _context5.prev = 8;
              _context5.next = 11;
              return this.extractReferences({
                '': [contentTypeUid]
              }, status);
            case 11:
              _yield$this$extractRe = _context5.sent;
              refPathMap = _yield$this$extractRe.refPathMap;
              jsonRtePaths = _yield$this$extractRe.jsonRtePaths;
              // store reference paths
              this.referenceFields[contentTypeUid] = refPathMap;
              this.referenceFieldsStorage.set(contentTypeUid, this.referenceFields[contentTypeUid]);
              // store json rte paths
              this.jsonRteFields[contentTypeUid] = jsonRtePaths;
              this.jsonRteFieldsStorage.set(contentTypeUid, this.jsonRteFields[contentTypeUid]);
              _context5.next = 25;
              break;
            case 20:
              _context5.prev = 20;
              _context5.t0 = _context5["catch"](8);
              console.error("Contentstack Gatsby (Live Preview): an error occurred while determining reference paths", _context5.t0);
              console.log("Contentstack Gatsby (Live Preview): unable to determine reference paths. This may have occurred due to the way the content types refer each other. Please try including the cslp__meta field in your query.");
              return _context5.abrupt("return", receivedData);
            case 25:
              referencePaths = Object.keys(this.referenceFields[contentTypeUid]);
              referencePaths = referencePaths.filter(function (field) {
                return !!field;
              });
              paths = this.identifyReferences(receivedData, [], referencePaths);
              this.statusStorage.set(contentTypeUid, status);
              if (status.hasLivePreviewEntryFound) {
                _context5.next = 31;
                break;
              }
              return _context5.abrupt("return", receivedData);
            case 31:
              _context5.next = 33;
              return this.fetchEntry(entryUid, contentTypeUid, paths, (_this$jsonRteFields$c = this.jsonRteFields[contentTypeUid]) !== null && _this$jsonRteFields$c !== void 0 ? _this$jsonRteFields$c : []);
            case 33:
              entry = _context5.sent;
              return _context5.abrupt("return", entry);
            case 35:
            case "end":
              return _context5.stop();
          }
        }, _callee5, this, [[8, 20]]);
      }));
      function getUsingTypeName(_x5) {
        return _getUsingTypeName.apply(this, arguments);
      }
      return getUsingTypeName;
    }()
  }, {
    key: "get",
    value: function () {
      var _get = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee6(data) {
        var _this$stackSdk$live_p,
          _this5 = this;
        var dataCloned, hasTypeNameAndUid, hasCslpMetaAtRoot, multipleEntriesKey, hasSingleEntry, hasMultipleEntries, receivedData, live_preview, hasCslpMeta, hasMultipleCslpMeta, multipleLPEntries, result, _entryCslpMeta$refere, _entryCslpMeta$jsonRt, entryCslpMeta, contentTypeUid, entryUid, refPaths, rtePaths, entry;
        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) switch (_context6.prev = _context6.next) {
            case 0:
              if (!(this.stackSdk.live_preview && !((_this$stackSdk$live_p = this.stackSdk.live_preview) !== null && _this$stackSdk$live_p !== void 0 && _this$stackSdk$live_p.enable))) {
                _context6.next = 3;
                break;
              }
              console.warn("Contentstack Gatsby (Live Preview): live preview is disabled in config");
              return _context6.abrupt("return", data);
            case 3:
              if (!(data === null)) {
                _context6.next = 6;
                break;
              }
              console.warn("Contentstack Gatsby (Live Preview): null was passed to get()");
              return _context6.abrupt("return", data);
            case 6:
              if (this.isNested(data)) {
                _context6.next = 9;
                break;
              }
              console.warn("Contentstack Gatsby (Live Preview): data passed to get() is invalid");
              return _context6.abrupt("return", data);
            case 9:
              dataCloned = (0, _lodash2["default"])(data);
              delete dataCloned["$"];

              // old method metadata
              hasTypeNameAndUid = dataCloned.uid && dataCloned.__typename; // new method metadata
              hasCslpMetaAtRoot = dataCloned.cslp__meta;
              multipleEntriesKey = Object.keys(dataCloned);
              hasSingleEntry = !hasCslpMetaAtRoot && multipleEntriesKey.length === 1;
              hasMultipleEntries = !hasCslpMetaAtRoot && multipleEntriesKey.length > 1;
              receivedData = hasSingleEntry || hasMultipleEntries ? this.unwrapEntryData(dataCloned) : dataCloned;
              live_preview = this.stackSdk.live_preview;
              if (!(live_preview !== null && live_preview !== void 0 && live_preview.hash && live_preview.hash !== 'init')) {
                _context6.next = 59;
                break;
              }
              this.livePreviewConfig = live_preview;
              hasCslpMeta = receivedData.cslp__meta; // item can be null, since gatsby can return null
              hasMultipleCslpMeta = Array.isArray(receivedData) && receivedData.length > 1 && receivedData.every(function (item) {
                return item === null || item.cslp__meta;
              });
              if (!(!hasCslpMeta && !hasMultipleCslpMeta && !hasTypeNameAndUid)) {
                _context6.next = 24;
                break;
              }
              throw new Error("Contentstack Gatsby (Live Preview): Entry data must contain cslp__meta for live preview");
            case 24:
              if (!hasMultipleCslpMeta) {
                _context6.next = 40;
                break;
              }
              _context6.prev = 25;
              _context6.next = 28;
              return Promise.all(receivedData.map(function (item) {
                if (item === null) {
                  return Promise.resolve(null);
                }
                return _this5.fetchEntry(item.cslp__meta.entryUid, item.cslp__meta.contentTypeUid, item.cslp__meta.refPaths, item.cslp__meta.rtePaths);
              }));
            case 28:
              multipleLPEntries = _context6.sent;
              result = {};
              multipleEntriesKey.forEach(function (key, index) {
                result[key] = multipleLPEntries[index];
              });
              return _context6.abrupt("return", result);
            case 34:
              _context6.prev = 34;
              _context6.t0 = _context6["catch"](25);
              console.error("Contentstack Gatsby (Live Preview):", _context6.t0);
              return _context6.abrupt("return", dataCloned);
            case 38:
              _context6.next = 59;
              break;
            case 40:
              if (!hasCslpMeta) {
                _context6.next = 55;
                break;
              }
              entryCslpMeta = receivedData.cslp__meta;
              contentTypeUid = entryCslpMeta.contentTypeUid;
              entryUid = entryCslpMeta.entryUid;
              if (!(!entryUid || !contentTypeUid)) {
                _context6.next = 47;
                break;
              }
              console.warn("Contentstack Gatsby (Live Preview): no entry uid or content type uid was found inside cslp__meta");
              return _context6.abrupt("return", dataCloned);
            case 47:
              refPaths = (_entryCslpMeta$refere = entryCslpMeta.referencePaths) !== null && _entryCslpMeta$refere !== void 0 ? _entryCslpMeta$refere : [];
              rtePaths = (_entryCslpMeta$jsonRt = entryCslpMeta.jsonRtePaths) !== null && _entryCslpMeta$jsonRt !== void 0 ? _entryCslpMeta$jsonRt : [];
              _context6.next = 51;
              return this.fetchEntry(entryUid, contentTypeUid, refPaths, rtePaths);
            case 51:
              entry = _context6.sent;
              return _context6.abrupt("return", entry);
            case 55:
              if (!hasTypeNameAndUid) {
                _context6.next = 59;
                break;
              }
              _context6.next = 58;
              return this.getUsingTypeName(dataCloned);
            case 58:
              return _context6.abrupt("return", _context6.sent);
            case 59:
              return _context6.abrupt("return", dataCloned);
            case 60:
            case "end":
              return _context6.stop();
          }
        }, _callee6, this, [[25, 34]]);
      }));
      function get(_x6) {
        return _get.apply(this, arguments);
      }
      return get;
    }()
  }], [{
    key: "addContentTypeUidFromTypename",
    value: function addContentTypeUidFromTypename(entry) {
      if (typeof entry === "undefined") {
        throw new TypeError("entry cannot be empty");
      }
      if (entry === null) {
        throw new TypeError("entry cannot be null");
      }
      if ((0, _typeof2["default"])(entry) !== "object") {
        throw new TypeError("entry must be an object");
      }
      if (Array.isArray(entry)) {
        throw new TypeError("entry cannot be an object, pass an instance of entry");
      }
      traverse(entry);
      function traverse(field) {
        if (!field || (0, _typeof2["default"])(field) !== "object") {
          return;
        }
        if (Array.isArray(field)) {
          field.forEach(function (instance) {
            return traverse(instance);
          });
        }
        if (Object.hasOwnProperty.call(field, "__typename") && typeof field.__typename == "string") {
          field._content_type_uid = field.__typename.split("_").slice(1).join("_");
        }
        Object.values(field).forEach(function (subField) {
          return traverse(subField);
        });
      }
    }
  }]);
}();
//# sourceMappingURL=index.js.map