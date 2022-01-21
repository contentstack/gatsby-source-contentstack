'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var _require = require('gatsby/graphql'),
    GraphQLInt = _require.GraphQLInt,
    GraphQLJSON = _require.GraphQLJSON,
    GraphQLString = _require.GraphQLString;

var _require2 = require('./gatsby-plugin-image'),
    resolveGatsbyImageData = _require2.resolveGatsbyImageData;

exports.getGatsbyImageData = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(_ref2) {
    var cache, reporter, fieldConfig, _yield$import, getGatsbyImageFieldConfig, gatsbyImageData;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            cache = _ref2.cache, reporter = _ref2.reporter;
            fieldConfig = {};
            _context2.prev = 2;
            _context2.next = 5;
            return Promise.resolve().then(function () {
              return _interopRequireWildcard(require('gatsby-plugin-image/graphql-utils'));
            });

          case 5:
            _yield$import = _context2.sent;
            getGatsbyImageFieldConfig = _yield$import.getGatsbyImageFieldConfig;
            fieldConfig = getGatsbyImageFieldConfig( /*#__PURE__*/function () {
              var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(image, options) {
                return _regenerator["default"].wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        return _context.abrupt("return", resolveGatsbyImageData({
                          image: image,
                          options: options,
                          cache: cache,
                          reporter: reporter
                        }));

                      case 1:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));

              return function (_x2, _x3) {
                return _ref3.apply(this, arguments);
              };
            }(), {
              fit: {
                type: GraphQLString
              },
              crop: {
                type: GraphQLString
              },
              trim: {
                type: GraphQLString
              },
              pad: {
                type: GraphQLString
              },
              quality: {
                type: GraphQLInt,
                defaultValue: 50
              }
            });
            fieldConfig.type = GraphQLJSON;
            _context2.next = 14;
            break;

          case 11:
            _context2.prev = 11;
            _context2.t0 = _context2["catch"](2);
            reporter.info("Gatsby plugin image is required to use new gatsby image plugin's feature. Please check https://github.com/contentstack/gatsby-source-contentstack#the-new-gatsby-image-plugin for more help.");

          case 14:
            gatsbyImageData = fieldConfig;
            return _context2.abrupt("return", {
              gatsbyImageData: gatsbyImageData
            });

          case 16:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[2, 11]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();