'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));
var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));
var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var FetchContentTypes = /*#__PURE__*/function () {
  function FetchContentTypes() {
    (0, _classCallCheck2["default"])(this, FetchContentTypes);
  }
  (0, _createClass2["default"])(FetchContentTypes, [{
    key: "getPagedData",
    value: function () {
      var _getPagedData = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
            case "end":
              return _context.stop();
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
      var _getPagedData2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(url, config, responseKey, fn) {
        var query, result;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              query = {
                include_global_field_schema: true
              };
              _context2.next = 3;
              return fn.apply(null, [url, config, responseKey, query]);
            case 3:
              result = _context2.sent;
              return _context2.abrupt("return", result);
            case 5:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }));
      function getPagedData(_x, _x2, _x3, _x4) {
        return _getPagedData2.apply(this, arguments);
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
      var _getPagedData3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(url, config, responseKey, fn) {
        var query, contentTypes, referredContentTypes, referredContentTypesList, referredContentTypesData, result;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              query = {
                query: JSON.stringify({
                  uid: {
                    $in: config.contentTypes
                  }
                }),
                include_global_field_schema: true
              };
              _context3.next = 3;
              return fn.apply(null, [url, config, responseKey, query]);
            case 3:
              contentTypes = _context3.sent;
              referredContentTypes = new ReferredContentTypes();
              referredContentTypesList = referredContentTypes.getReferredContentTypes(contentTypes);
              referredContentTypesData = [];
              if (!referredContentTypesList.length) {
                _context3.next = 12;
                break;
              }
              query.query = JSON.stringify({
                uid: {
                  $in: referredContentTypesList
                }
              });
              _context3.next = 11;
              return fn.apply(null, [url, config, responseKey, query]);
            case 11:
              referredContentTypesData = _context3.sent;
            case 12:
              result = contentTypes.concat(referredContentTypesData);
              return _context3.abrupt("return", result);
            case 14:
            case "end":
              return _context3.stop();
          }
        }, _callee3);
      }));
      function getPagedData(_x5, _x6, _x7, _x8) {
        return _getPagedData3.apply(this, arguments);
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
      var _getPagedData4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(url, config, responseKey, fn) {
        var query, contentTypes, referredContentTypes, referredContentTypesList, referredContentTypesData, result;
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
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
              return fn.apply(null, [url, config, responseKey, query]);
            case 3:
              contentTypes = _context4.sent;
              referredContentTypes = new ReferredContentTypes();
              referredContentTypesList = referredContentTypes.getReferredContentTypes(contentTypes);
              referredContentTypesData = [];
              if (!referredContentTypesList.length) {
                _context4.next = 12;
                break;
              }
              query.query = JSON.stringify({
                uid: {
                  $in: referredContentTypesList
                }
              });
              _context4.next = 11;
              return fn.apply(null, [url, config, responseKey, query]);
            case 11:
              referredContentTypesData = _context4.sent;
            case 12:
              result = contentTypes.concat(referredContentTypesData);
              return _context4.abrupt("return", result);
            case 14:
            case "end":
              return _context4.stop();
          }
        }, _callee4);
      }));
      function getPagedData(_x9, _x10, _x11, _x12) {
        return _getPagedData4.apply(this, arguments);
      }
      return getPagedData;
    }()
  }]);
  return FetchUnspecifiedContentTypes;
}(FetchContentTypes);
var ReferredContentTypes = /*#__PURE__*/function () {
  function ReferredContentTypes() {
    (0, _classCallCheck2["default"])(this, ReferredContentTypes);
  }
  (0, _createClass2["default"])(ReferredContentTypes, [{
    key: "getReferredContentTypes",
    value: function getReferredContentTypes(contentTypes) {
      var referredContentTypes = {};
      for (var i = 0; i < contentTypes.length; i++) {
        var contentType = contentTypes[i];
        for (var j = 0; j < contentType.schema.length; j++) {
          var schema = contentType.schema[j];
          if (schema.data_type === 'reference') {
            for (var k = 0; k < schema.reference_to.length; k++) {
              // Keep unique values only.
              referredContentTypes[schema.reference_to[k]] = null;
            }
          }
        }
      }
      // Remove the content-types if they were already fetched.
      for (var _i = 0; _i < contentTypes.length; _i++) {
        var _contentType = contentTypes[_i].uid;
        var keys = Object.keys(referredContentTypes);
        if (keys.includes(_contentType)) {
          delete referredContentTypes[_contentType];
        }
      }
      return Object.keys(referredContentTypes);
    }
  }]);
  return ReferredContentTypes;
}();
exports.FetchContentTypes = FetchContentTypes;
exports.FetchDefaultContentTypes = FetchDefaultContentTypes;
exports.FetchSpecifiedContentTypes = FetchSpecifiedContentTypes;
exports.FetchUnspecifiedContentTypes = FetchUnspecifiedContentTypes;
//# sourceMappingURL=contenttype-data.js.map