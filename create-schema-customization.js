'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var _require = require('gatsby/graphql'),
    GraphQLInt = _require.GraphQLInt,
    GraphQLJSON = _require.GraphQLJSON,
    GraphQLString = _require.GraphQLString;

var _require2 = require('./normalize'),
    buildCustomSchema = _require2.buildCustomSchema,
    extendSchemaWithDefaultEntryFields = _require2.extendSchemaWithDefaultEntryFields;

var _require3 = require('./fetch'),
    fetchContentTypes = _require3.fetchContentTypes;

var _require4 = require('./utils'),
    getContentTypeOption = _require4.getContentTypeOption;

var _require5 = require('./gatsby-plugin-image'),
    resolveGatsbyImageData = _require5.resolveGatsbyImageData;

exports.createSchemaCustomization = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(_ref2, configOptions) {
    var cache, actions, schema, reporter, contentTypes, typePrefix, disableMandatoryFields, contentTypeOption, references, groups, fileFields, createTypes, contentTypeSchema, assetTypeSchema, _yield$import, getGatsbyImageFieldConfig, fieldConfig;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            cache = _ref2.cache, actions = _ref2.actions, schema = _ref2.schema, reporter = _ref2.reporter;
            typePrefix = configOptions.type_prefix || 'Contentstack';
            disableMandatoryFields = configOptions.disableMandatoryFields || false;
            _context2.prev = 3;
            contentTypeOption = getContentTypeOption(configOptions);
            _context2.next = 7;
            return fetchContentTypes(configOptions, contentTypeOption);

          case 7:
            contentTypes = _context2.sent;
            _context2.next = 10;
            return cache.set(typePrefix, contentTypes);

          case 10:
            _context2.next = 15;
            break;

          case 12:
            _context2.prev = 12;
            _context2.t0 = _context2["catch"](3);
            console.error('Contentstack fetch content type failed!');

          case 15:
            references = [], groups = [], fileFields = [];

            if (!configOptions.enableSchemaGeneration) {
              _context2.next = 49;
              break;
            }

            createTypes = actions.createTypes;
            /** Type definition for content-type schema */

            contentTypeSchema = {
              name: "".concat(typePrefix, "ContentTypes"),
              fields: {
                title: 'String!',
                uid: 'String!',
                created_at: {
                  type: 'Date',
                  extensions: {
                    dateformat: {}
                  }
                },
                updated_at: {
                  type: 'Date',
                  extensions: {
                    dateformat: {}
                  }
                },
                schema: 'JSON!',
                description: 'String'
              },
              interfaces: ['Node'],
              extensions: {
                infer: false
              }
            };
            /** Type definition for asset schema */

            assetTypeSchema = {
              name: "".concat(typePrefix, "_assets"),
              fields: _objectSpread({
                url: 'String'
              }, configOptions.downloadImages ? {
                localAsset: {
                  type: 'File',
                  extensions: {
                    link: {
                      from: "fields.localAsset"
                    }
                  }
                }
              } : {}),
              interfaces: ['Node'],
              extensions: {
                infer: true
              }
            }; // Checks if gatsby-plugin-image is installed.

            _context2.prev = 20;
            _context2.next = 23;
            return Promise.resolve().then(function () {
              return _interopRequireWildcard(require('gatsby-plugin-image/graphql-utils'));
            });

          case 23:
            _yield$import = _context2.sent;
            getGatsbyImageFieldConfig = _yield$import.getGatsbyImageFieldConfig;
            fieldConfig = {};
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

              return function (_x3, _x4) {
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
            assetTypeSchema.fields.gatsbyImageData = fieldConfig;
            _context2.next = 34;
            break;

          case 31:
            _context2.prev = 31;
            _context2.t1 = _context2["catch"](20);

            if (_context2.t1.code === 'MODULE_NOT_FOUND') {
              reporter.info("Gatsby plugin image is required to use new gatsby image plugin's feature. Please check https://github.com/contentstack/gatsby-source-contentstack#the-new-gatsby-image-plugin for more help.");
            }

          case 34:
            createTypes([schema.buildObjectType(contentTypeSchema), schema.buildObjectType(assetTypeSchema)]);
            contentTypes && contentTypes.forEach(function (contentType) {
              var contentTypeUid = contentType.uid.replace(/-/g, '_');
              var name = "".concat(typePrefix, "_").concat(contentTypeUid);
              var extendedSchema = extendSchemaWithDefaultEntryFields(contentType.schema);
              var result = buildCustomSchema(extendedSchema, [], [], [], [], name, typePrefix, disableMandatoryFields);
              references = references.concat(result.references);
              groups = groups.concat(result.groups);
              fileFields = fileFields.concat(result.fileFields);
              var typeDefs = ["type linktype { title: String href: String }", schema.buildObjectType({
                name: name,
                fields: result.fields,
                interfaces: ['Node'],
                extensions: {
                  infer: true
                }
              })];
              result.types = result.types.concat(typeDefs);
              createTypes(result.types);
            });
            _context2.t2 = Promise;
            _context2.next = 39;
            return cache.set("".concat(typePrefix, "_").concat(configOptions.api_key, "_references"), references);

          case 39:
            _context2.t3 = _context2.sent;
            _context2.next = 42;
            return cache.set("".concat(typePrefix, "_").concat(configOptions.api_key, "_groups"), groups);

          case 42:
            _context2.t4 = _context2.sent;
            _context2.next = 45;
            return cache.set("".concat(typePrefix, "_").concat(configOptions.api_key, "_file_fields"), fileFields);

          case 45:
            _context2.t5 = _context2.sent;
            _context2.t6 = [_context2.t3, _context2.t4, _context2.t5];
            _context2.next = 49;
            return _context2.t2.all.call(_context2.t2, _context2.t6);

          case 49:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[3, 12], [20, 31]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();