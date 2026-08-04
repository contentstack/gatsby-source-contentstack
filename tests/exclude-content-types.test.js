"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _require = require('../entry-data'),
  FetchSpecifiedContentTypesEntries = _require.FetchSpecifiedContentTypesEntries;
var _require2 = require('../contenttype-data'),
  FetchUnspecifiedContentTypes = _require2.FetchUnspecifiedContentTypes;
function createMockCache(store) {
  return {
    get: function () {
      var _get = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(key) {
        return _regenerator["default"].wrap(function (_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", store[key]);
            case 1:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));
      function get(_x) {
        return _get.apply(this, arguments);
      }
      return get;
    }(),
    set: function () {
      var _set = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(key, value) {
        return _regenerator["default"].wrap(function (_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              store[key] = value;
            case 1:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }));
      function set(_x2, _x3) {
        return _set.apply(this, arguments);
      }
      return set;
    }()
  };
}
describe('excludeContentTypes cache isolation across instances sharing a type_prefix', function () {
  test('reads its own instance content-types list, not another stack\'s', /*#__PURE__*/(0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3() {
    var store, cache, fn, configA, syncedContentTypeUids;
    return _regenerator["default"].wrap(function (_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          store = {
            'Contentstack_stackA': [{
              uid: 'blog'
            }],
            'Contentstack_stackB': [{
              uid: 'blog'
            }, {
              uid: 'home'
            }]
          };
          cache = createMockCache(store);
          fn = jest.fn().mockResolvedValue({
            data: []
          });
          configA = {
            type_prefix: 'Contentstack',
            api_key: 'stackA',
            excludeContentTypes: ['home']
          };
          _context3.next = 1;
          return new FetchSpecifiedContentTypesEntries().fetchEntries(configA, cache, fn);
        case 1:
          syncedContentTypeUids = fn.mock.calls.map(function (_ref2) {
            var _ref3 = (0, _slicedToArray2["default"])(_ref2, 1),
              params = _ref3[0];
            return params.content_type_uid;
          });
          expect(syncedContentTypeUids).toEqual(['blog']);
        case 2:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  })));
});
describe('FetchUnspecifiedContentTypes referred content types', function () {
  test('excludes referred content types that are in excludeContentTypes', /*#__PURE__*/(0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee4() {
    var config, primaryContentTypes, fn, secondCallQuery;
    return _regenerator["default"].wrap(function (_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          config = {
            excludeContentTypes: ['author']
          };
          primaryContentTypes = [{
            uid: 'blog',
            schema: [{
              data_type: 'reference',
              reference_to: ['author', 'category']
            }]
          }];
          fn = jest.fn().mockResolvedValueOnce(primaryContentTypes).mockResolvedValueOnce([{
            uid: 'category',
            schema: []
          }]);
          _context4.next = 1;
          return new FetchUnspecifiedContentTypes().getPagedData('content_types', config, 'content_types', fn);
        case 1:
          secondCallQuery = JSON.parse(fn.mock.calls[1][3].query);
          expect(secondCallQuery.uid.$in).toEqual(['category']);
        case 2:
        case "end":
          return _context4.stop();
      }
    }, _callee4);
  })));
});
//# sourceMappingURL=exclude-content-types.test.js.map