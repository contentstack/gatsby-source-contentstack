'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var _require = require('gatsby/graphql'),
    GraphQLBoolean = _require.GraphQLBoolean,
    GraphQLInt = _require.GraphQLInt,
    GraphQLJSON = _require.GraphQLJSON;

var _require2 = require('./gatsby-plugin-image'),
    resolveGatsbyImageData = _require2.resolveGatsbyImageData;

var _require3 = require('./schemes'),
    ImageResizingBehavior = _require3.ImageResizingBehavior,
    ImageCropFocusType = _require3.ImageCropFocusType;

exports.setFieldsOnGraphQLNodeType = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(_ref2, configOptions) {
    var type, cache, typePrefix, getGatsbyImageData, gatsbyImageData;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            type = _ref2.type, cache = _ref2.cache;
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
                        _context2.next = 2;
                        return Promise.resolve().then(function () {
                          return _interopRequireWildcard(require('gatsby-plugin-image/graphql-utils'));
                        });

                      case 2:
                        _yield$import = _context2.sent;
                        getGatsbyImageFieldConfig = _yield$import.getGatsbyImageFieldConfig;
                        fieldConfig = getGatsbyImageFieldConfig( /*#__PURE__*/function () {
                          var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
                            var _len,
                                args,
                                _key,
                                _args = arguments;

                            return _regenerator["default"].wrap(function _callee$(_context) {
                              while (1) {
                                switch (_context.prev = _context.next) {
                                  case 0:
                                    for (_len = _args.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                                      args[_key] = _args[_key];
                                    }

                                    return _context.abrupt("return", resolveGatsbyImageData.apply(void 0, args.concat([{
                                      cache: cache
                                    }])));

                                  case 2:
                                  case "end":
                                    return _context.stop();
                                }
                              }
                            }, _callee);
                          }));

                          return function () {
                            return _ref4.apply(this, arguments);
                          };
                        }(), {
                          jpegProgressive: {
                            type: GraphQLBoolean,
                            defaultValue: true
                          },
                          resizingBehavior: {
                            type: ImageResizingBehavior
                          },
                          cropFocus: {
                            type: ImageCropFocusType
                          },
                          cornerRadius: {
                            type: GraphQLInt,
                            defaultValue: 0 // description: ''

                          },
                          quality: {
                            type: GraphQLInt,
                            defaultValue: 50
                          }
                        });
                        fieldConfig.type = GraphQLJSON;
                        return _context2.abrupt("return", fieldConfig);

                      case 7:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2);
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