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

var _require3 = require('./utils'),
    CODES = _require3.CODES;

exports.setFieldsOnGraphQLNodeType = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(_ref2, configOptions) {
    var type, cache, reporter, typePrefix, getGatsbyImageData, gatsbyImageData;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            type = _ref2.type, cache = _ref2.cache, reporter = _ref2.reporter;
            typePrefix = configOptions.type_prefix || 'Contentstack';

            if (!(type.name !== "".concat(typePrefix, "_assets"))) {
              _context3.next = 4;
              break;
            }

            return _context3.abrupt("return", {});

          case 4:
            // gatsby-plugin-image
            getGatsbyImageData = /*#__PURE__*/function () {
              var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
                var _yield$import, getGatsbyImageFieldConfig, fieldConfig;

                return _regenerator["default"].wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        _context2.prev = 0;
                        _context2.next = 3;
                        return Promise.resolve().then(function () {
                          return _interopRequireWildcard(require('gatsby-plugin-image/graphql-utils'));
                        });

                      case 3:
                        _yield$import = _context2.sent;
                        getGatsbyImageFieldConfig = _yield$import.getGatsbyImageFieldConfig;
                        fieldConfig = getGatsbyImageFieldConfig( /*#__PURE__*/function () {
                          var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(image, options) {
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

                          return function (_x3, _x4) {
                            return _ref4.apply(this, arguments);
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
                        return _context2.abrupt("return", fieldConfig);

                      case 10:
                        _context2.prev = 10;
                        _context2.t0 = _context2["catch"](0);
                        reporter.panic({
                          id: CODES.MissingDependencyError,
                          context: {
                            sourceMessage: "Gatsby plugin image is required. Please check https://github.com/contentstack/gatsby-source-contentstack#the-new-gatsby-image-plugin for more help."
                          },
                          error: _context2.t0
                        });

                      case 13:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2, null, [[0, 10]]);
              }));

              return function getGatsbyImageData() {
                return _ref3.apply(this, arguments);
              };
            }();

            _context3.next = 7;
            return getGatsbyImageData();

          case 7:
            gatsbyImageData = _context3.sent;
            return _context3.abrupt("return", {
              gatsbyImageData: gatsbyImageData
            });

          case 9:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();