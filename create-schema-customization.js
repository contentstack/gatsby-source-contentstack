'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t8 in e) "default" !== _t8 && {}.hasOwnProperty.call(e, _t8) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t8)) && (i.get || i.set) ? o(f, _t8, i) : f[_t8] = e[_t8]); return f; })(e, t); }
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
      var contentTypes, typePrefix, disableMandatoryFields, jsonRteToHtml, contentTypeOption, references, groups, fileFields, jsonRteFields, createTypes, contentTypeSchema, assetTypeSchema, _yield$import, getGatsbyImageFieldConfig, fieldConfig, _t, _t2, _t3, _t4, _t5, _t6, _t7;
      return _regenerator["default"].wrap(function (_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            typePrefix = configOptions.type_prefix || 'Contentstack';
            disableMandatoryFields = configOptions.disableMandatoryFields || false;
            jsonRteToHtml = configOptions.jsonRteToHtml || false;
            _context2.prev = 1;
            contentTypeOption = getContentTypeOption(configOptions);
            _context2.next = 2;
            return fetchContentTypes(configOptions, contentTypeOption);
          case 2:
            contentTypes = _context2.sent;
            _context2.next = 3;
            return cache.set(typePrefix, contentTypes);
          case 3:
            _context2.next = 5;
            break;
          case 4:
            _context2.prev = 4;
            _t = _context2["catch"](1);
            console.error('Contentstack fetch content type failed!');
          case 5:
            references = [], groups = [], fileFields = [], jsonRteFields = [];
            if (!configOptions.enableSchemaGeneration) {
              _context2.next = 14;
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
            _context2.prev = 6;
            _context2.next = 7;
            return Promise.resolve().then(function () {
              return _interopRequireWildcard(require('gatsby-plugin-image/graphql-utils'));
            });
          case 7:
            _yield$import = _context2.sent;
            getGatsbyImageFieldConfig = _yield$import.getGatsbyImageFieldConfig;
            fieldConfig = {};
            fieldConfig = getGatsbyImageFieldConfig(/*#__PURE__*/function () {
              var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(image, options) {
                return _regenerator["default"].wrap(function (_context) {
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
            _context2.next = 9;
            break;
          case 8:
            _context2.prev = 8;
            _t2 = _context2["catch"](6);
            if (_t2.code === 'MODULE_NOT_FOUND') {
              reporter.info("Gatsby plugin image is required to use new gatsby image plugin's feature. Please check https://github.com/contentstack/gatsby-source-contentstack#the-new-gatsby-image-plugin for more help.");
            }
          case 9:
            createTypes([schema.buildObjectType(contentTypeSchema), schema.buildObjectType(assetTypeSchema)]);
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
            _t3 = Promise;
            _context2.next = 10;
            return cache.set("".concat(typePrefix, "_").concat(configOptions.api_key, "_references"), references);
          case 10:
            _t4 = _context2.sent;
            _context2.next = 11;
            return cache.set("".concat(typePrefix, "_").concat(configOptions.api_key, "_groups"), groups);
          case 11:
            _t5 = _context2.sent;
            _context2.next = 12;
            return cache.set("".concat(typePrefix, "_").concat(configOptions.api_key, "_file_fields"), fileFields);
          case 12:
            _t6 = _context2.sent;
            _context2.next = 13;
            return cache.set("".concat(typePrefix, "_").concat(configOptions.api_key, "_json_rte_fields"), jsonRteFields);
          case 13:
            _t7 = _context2.sent;
            _context2.next = 14;
            return _t3.all.call(_t3, [_t4, _t5, _t6, _t7]);
          case 14:
          case "end":
            return _context2.stop();
        }
      }, _callee2, null, [[1, 4], [6, 8]]);
    })();
  });
  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=create-schema-customization.js.map