'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var FetchContentTypes = /*#__PURE__*/function () {
  function FetchContentTypes(query) {
    (0, _classCallCheck2["default"])(this, FetchContentTypes);
    (0, _defineProperty2["default"])(this, "query", void 0);
    this.query = query;
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

  function FetchDefaultContentTypes(query) {
    var _this;

    (0, _classCallCheck2["default"])(this, FetchDefaultContentTypes);
    _this = _super.call(this, query);
    _this.query = query;
    return _this;
  }

  (0, _createClass2["default"])(FetchDefaultContentTypes, [{
    key: "getPagedData",
    value: function () {
      var _getPagedData2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(url, config, responseKey, fn) {
        var result;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.query.query = JSON.stringify(this.query.query);
                _context2.next = 3;
                return fn.apply(null, [url, config, responseKey, this.query]);

              case 3:
                result = _context2.sent;
                return _context2.abrupt("return", result);

              case 5:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
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

  function FetchSpecifiedContentTypes(query) {
    var _this2;

    (0, _classCallCheck2["default"])(this, FetchSpecifiedContentTypes);
    _this2 = _super2.call(this, query); // We don't want to restrict the specified content-types download by last fetch time, as it can ignore updates from referred content-types.

    delete query.query;
    _this2.query = query;
    return _this2;
  }

  (0, _createClass2["default"])(FetchSpecifiedContentTypes, [{
    key: "getPagedData",
    value: function () {
      var _getPagedData3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(url, config, responseKey, fn) {
        var contentTypes, referredContentTypes, referredContentTypesList, referredContentTypesData, result;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                this.query.query.uid = {
                  $in: config.contentTypes
                };
                this.query.query = JSON.stringify(this.query.query);
                _context3.next = 4;
                return fn.apply(null, [url, config, responseKey, this.query]);

              case 4:
                contentTypes = _context3.sent;
                referredContentTypes = new ReferredContentTypes();
                referredContentTypesList = referredContentTypes.getReferredContentTypes(contentTypes);
                referredContentTypesData = [];

                if (!referredContentTypesList.length) {
                  _context3.next = 13;
                  break;
                }

                this.query.query = JSON.stringify({
                  uid: {
                    $in: referredContentTypesList
                  }
                });
                _context3.next = 12;
                return fn.apply(null, [url, config, responseKey, this.query]);

              case 12:
                referredContentTypesData = _context3.sent;

              case 13:
                result = contentTypes.concat(referredContentTypesData);
                return _context3.abrupt("return", result);

              case 15:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
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

  function FetchUnspecifiedContentTypes(query) {
    var _this3;

    (0, _classCallCheck2["default"])(this, FetchUnspecifiedContentTypes);
    _this3 = _super3.call(this, query); // We don't want to restrict the specified content-types download by last fetch time, as it can ignore updates from referred content-types.

    delete query.query;
    _this3.query = query;
    return _this3;
  }

  (0, _createClass2["default"])(FetchUnspecifiedContentTypes, [{
    key: "getPagedData",
    value: function () {
      var _getPagedData4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(url, config, responseKey, fn) {
        var contentTypes, referredContentTypes, referredContentTypesList, referredContentTypesData, result;
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                this.query.query.uid = {
                  $nin: config.excludeContentTypes
                };
                this.query.query = JSON.stringify(this.query.query);
                _context4.next = 4;
                return fn.apply(null, [url, config, responseKey, this.query]);

              case 4:
                contentTypes = _context4.sent;
                referredContentTypes = new ReferredContentTypes();
                referredContentTypesList = referredContentTypes.getReferredContentTypes(contentTypes);
                referredContentTypesData = [];

                if (!referredContentTypesList.length) {
                  _context4.next = 13;
                  break;
                }

                this.query.query = JSON.stringify({
                  uid: {
                    $in: referredContentTypesList
                  }
                });
                _context4.next = 12;
                return fn.apply(null, [url, config, responseKey, this.query]);

              case 12:
                referredContentTypesData = _context4.sent;

              case 13:
                result = contentTypes.concat(referredContentTypesData);
                return _context4.abrupt("return", result);

              case 15:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
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
      } // Remove the content-types if they were already fetched.


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