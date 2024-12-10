'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
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
  var _ref = (0, _asyncToGenerator2["default"])(function (_ref2, configOptions) {
    var cache = _ref2.cache,
      actions = _ref2.actions,
      schema = _ref2.schema,
      reporter = _ref2.reporter,
      createNodeId = _ref2.createNodeId;
    return /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var contentTypes, typePrefix, disableMandatoryFields, jsonRteToHtml, contentTypeOption, references, groups, fileFields, jsonRteFields, createTypes, contentTypeSchema, assetTypeSchema, _yield$import, getGatsbyImageFieldConfig, fieldConfig, hasTaxonomies, taxonomySchema;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            typePrefix = configOptions.type_prefix || 'Contentstack';
            disableMandatoryFields = configOptions.disableMandatoryFields || false;
            jsonRteToHtml = configOptions.jsonRteToHtml || false;
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
            console.error('Contentstack fetch content type failed!', _context2.t0);
          case 15:
            references = [], groups = [], fileFields = [], jsonRteFields = [];
            if (!configOptions.enableSchemaGeneration) {
              _context2.next = 54;
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
            fieldConfig = getGatsbyImageFieldConfig(/*#__PURE__*/function () {
              var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(image, options) {
                return _regenerator["default"].wrap(function _callee$(_context) {
                  while (1) switch (_context.prev = _context.next) {
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

            // Process Content Types
            contentTypes && contentTypes.forEach(function (contentType) {
              var contentTypeUid = contentType.uid.replace(/-/g, '_');
              var name = "".concat(typePrefix, "_").concat(contentTypeUid);
              var extendedSchema = extendSchemaWithDefaultEntryFields(contentType.schema);
              var result = buildCustomSchema(extendedSchema, [], [], [], [], [], name, typePrefix, disableMandatoryFields, jsonRteToHtml, createNodeId, undefined);
              references = references.concat(result.references);
              groups = groups.concat(result.groups);
              fileFields = fileFields.concat(result.fileFields);
              jsonRteFields = jsonRteFields.concat(result.jsonRteFields);
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

            // Check if content types include taxonomies
            hasTaxonomies = contentTypes.some(function (contentType) {
              return contentType.schema.some(function (field) {
                return field.data_type === 'taxonomy';
              });
            });
            if (hasTaxonomies) {
              taxonomySchema = "\n        type ".concat(typePrefix, "Taxonomy implements Node {\n          uid: String!\n          name: String!\n          terms: [").concat(typePrefix, "TaxonomyTerm!]!\n        }\n\n        type ").concat(typePrefix, "TaxonomyTerm {\n          uid: String!\n          name: String!\n          parent_uid: String\n          children: [").concat(typePrefix, "TaxonomyTerm!]\n        }\n      ");
              createTypes(taxonomySchema);
              reporter.info('Taxonomy schema added to the GraphQL schema.');
            }

            // Cache schema-related metadata
            _context2.t2 = Promise;
            _context2.next = 41;
            return cache.set("".concat(typePrefix, "_").concat(configOptions.api_key, "_references"), references);
          case 41:
            _context2.t3 = _context2.sent;
            _context2.next = 44;
            return cache.set("".concat(typePrefix, "_").concat(configOptions.api_key, "_groups"), groups);
          case 44:
            _context2.t4 = _context2.sent;
            _context2.next = 47;
            return cache.set("".concat(typePrefix, "_").concat(configOptions.api_key, "_file_fields"), fileFields);
          case 47:
            _context2.t5 = _context2.sent;
            _context2.next = 50;
            return cache.set("".concat(typePrefix, "_").concat(configOptions.api_key, "_json_rte_fields"), jsonRteFields);
          case 50:
            _context2.t6 = _context2.sent;
            _context2.t7 = [_context2.t3, _context2.t4, _context2.t5, _context2.t6];
            _context2.next = 54;
            return _context2.t2.all.call(_context2.t2, _context2.t7);
          case 54:
          case "end":
            return _context2.stop();
        }
      }, _callee2, null, [[3, 12], [20, 31]]);
    })();
  });
  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=create-schema-customization.js.map