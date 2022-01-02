'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _require = require('./normalize'),
    buildCustomSchema = _require.buildCustomSchema,
    extendSchemaWithDefaultEntryFields = _require.extendSchemaWithDefaultEntryFields;

var _require2 = require('./fetch'),
    fetchContentTypes = _require2.fetchContentTypes;

exports.createSchemaCustomization = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(_ref2, configOptions) {
    var cache, actions, schema, contentTypes, typePrefix, disableMandatoryFields, contentTypeOption, references, groups, fileFields, createTypes, name, fields;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            cache = _ref2.cache, actions = _ref2.actions, schema = _ref2.schema;
            typePrefix = configOptions.type_prefix || 'Contentstack';
            disableMandatoryFields = configOptions.disableMandatoryFields || false;
            _context.prev = 3;
            contentTypeOption = getContentTypeOption(configOptions);
            _context.next = 7;
            return fetchContentTypes(configOptions, contentTypeOption);

          case 7:
            contentTypes = _context.sent;
            _context.next = 10;
            return cache.set(typePrefix, contentTypes);

          case 10:
            _context.next = 15;
            break;

          case 12:
            _context.prev = 12;
            _context.t0 = _context["catch"](3);
            console.error('Contentstack fetch content type failed!');

          case 15:
            references = [], groups = [], fileFields = [];

            if (!configOptions.enableSchemaGeneration) {
              _context.next = 35;
              break;
            }

            createTypes = actions.createTypes;
            contentTypes.forEach(function (contentType) {
              var contentTypeUid = contentType.uid.replace(/-/g, '_');
              var name = "".concat(typePrefix, "_").concat(contentTypeUid);
              var extendedSchema = extendSchemaWithDefaultEntryFields(contentType.schema);
              var result = buildCustomSchema(extendedSchema, [], [], [], [], name, typePrefix, disableMandatoryFields);
              references = references.concat(result.references);
              groups = groups.concat(result.groups);
              fileFields = fileFields.concat(result.fileFields);
              var typeDefs = ["type linktype {\n              title: String\n              href: String\n        }", schema.buildObjectType({
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
            _context.t1 = Promise;
            _context.next = 22;
            return cache.set("".concat(typePrefix, "_").concat(configOptions.api_key, "_references"), references);

          case 22:
            _context.t2 = _context.sent;
            _context.next = 25;
            return cache.set("".concat(typePrefix, "_").concat(configOptions.api_key, "_groups"), groups);

          case 25:
            _context.t3 = _context.sent;
            _context.next = 28;
            return cache.set("".concat(typePrefix, "_").concat(configOptions.api_key, "_file_fields"), fileFields);

          case 28:
            _context.t4 = _context.sent;
            _context.t5 = [_context.t2, _context.t3, _context.t4];
            _context.next = 32;
            return _context.t1.all.call(_context.t1, _context.t5);

          case 32:
            /**CREATE TYPE DEFINITION FOR CONTENTTYPE OBJECT */
            name = "".concat(typePrefix, "ContentTypes");
            fields = {
              title: 'String!',
              uid: 'String!',
              created_at: 'Date',
              updated_at: 'Date',
              schema: 'JSON!',
              description: 'String'
            };
            createTypes([schema.buildObjectType({
              name: name,
              fields: fields,
              interfaces: ['Node'],
              extensions: {
                infer: false
              }
            })]);

          case 35:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[3, 12]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();