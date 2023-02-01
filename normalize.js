'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var _require = require('./utils'),
  getJSONToHtmlRequired = _require.getJSONToHtmlRequired;
exports.processContentType = function (contentType, createNodeId, createContentDigest, typePrefix) {
  var nodeId = createNodeId("".concat(typePrefix.toLowerCase(), "-contentType-").concat(contentType.uid));
  var type = "".concat(typePrefix, "ContentTypes");
  var nodeContent = JSON.stringify(contentType);
  var nodeData = _objectSpread(_objectSpread({}, contentType), {}, {
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: type,
      content: nodeContent,
      contentDigest: createContentDigest(nodeContent)
    }
  });
  return nodeData;
};
exports.processAsset = function (asset, createNodeId, createContentDigest, typePrefix) {
  var nodeId = makeAssetNodeUid(asset, createNodeId, typePrefix);
  var nodeContent = JSON.stringify(asset);
  var nodeData = _objectSpread(_objectSpread({}, asset), {}, {
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: "".concat(typePrefix, "_assets"),
      content: nodeContent,
      contentDigest: createContentDigest(nodeContent)
    }
  });
  return nodeData;
};
exports.processEntry = function (contentType, entry, createNodeId, createContentDigest, typePrefix) {
  var nodeId = makeEntryNodeUid(entry, createNodeId, typePrefix);
  var nodeContent = JSON.stringify(entry);
  var nodeData = _objectSpread(_objectSpread({}, entry), {}, {
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: "".concat(typePrefix, "_").concat(contentType.uid),
      content: nodeContent,
      contentDigest: createContentDigest(nodeContent)
    }
  });
  return nodeData;
};
exports.normalizeEntry = function (contentType, entry, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix, configOptions) {
  var _entry$publish_detail;
  var resolveEntry = _objectSpread(_objectSpread({}, entry), builtEntry(contentType.schema, entry, entry === null || entry === void 0 ? void 0 : (_entry$publish_detail = entry.publish_details) === null || _entry$publish_detail === void 0 ? void 0 : _entry$publish_detail.locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix, configOptions));
  return resolveEntry;
};
var makeAssetNodeUid = exports.makeAssetNodeUid = function (asset, createNodeId, typePrefix) {
  var _asset$publish_detail;
  var publishedLocale = asset === null || asset === void 0 ? void 0 : (_asset$publish_detail = asset.publish_details) === null || _asset$publish_detail === void 0 ? void 0 : _asset$publish_detail.locale;
  return createNodeId("".concat(typePrefix.toLowerCase(), "-assets-").concat(asset.uid, "-").concat(publishedLocale));
};
var makeEntryNodeUid = exports.makeEntryNodeUid = function (entry, createNodeId, typePrefix) {
  var _entry$publish_detail2;
  var publishedLocale = entry === null || entry === void 0 ? void 0 : (_entry$publish_detail2 = entry.publish_details) === null || _entry$publish_detail2 === void 0 ? void 0 : _entry$publish_detail2.locale;
  return createNodeId("".concat(typePrefix.toLowerCase(), "-entry-").concat(entry.uid, "-").concat(publishedLocale));
};
var normalizeGroup = function normalizeGroup(field, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix, configOptions) {
  var groupObj = null;
  if (field.multiple) {
    groupObj = [];
    if (value instanceof Array) {
      value.forEach(function (groupValue) {
        groupObj.push(builtEntry(field.schema, groupValue, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix, configOptions));
      });
    } else {
      // In some cases value is null, this makes graphql treat all the objects as null
      // So need to pass a valid array instance.
      // This also helps to handle when a user changes a group to multiple after initially
      // setting a group to single.. the server passes an object and the previous condition
      // again makes groupObj null
      groupObj.push(builtEntry(field.schema, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix, configOptions));
    }
  } else {
    groupObj = {};
    groupObj = builtEntry(field.schema, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix, configOptions);
  }
  return groupObj;
};
var normalizeModularBlock = function normalizeModularBlock(blocks, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix, configOptions) {
  var modularBlocksObj = [];
  if (value) {
    value.map(function (block) {
      Object.keys(block).forEach(function (key) {
        var blockSchema = blocks.filter(function (block) {
          return block.uid === key;
        });
        if (!blockSchema.length) {
          // block value no longer exists block schema so ignore it
          return;
        }
        var blockObj = {};
        blockObj[key] = builtEntry(blockSchema[0].schema, block[key], locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix, configOptions);
        modularBlocksObj.push(blockObj);
      });
    });
  }
  return modularBlocksObj;
};
var normalizeReferenceField = function normalizeReferenceField(value, locale, entriesNodeIds, createNodeId, typePrefix) {
  var reference = [];
  if (value && !Array.isArray(value)) return;
  value.forEach(function (entry) {
    if ((0, _typeof2["default"])(entry) === 'object' && entry.uid) {
      if (entriesNodeIds.has(createNodeId("".concat(typePrefix.toLowerCase(), "-entry-").concat(entry.uid, "-").concat(locale)))) {
        reference.push(createNodeId("".concat(typePrefix.toLowerCase(), "-entry-").concat(entry.uid, "-").concat(locale)));
      }
    } else if (entriesNodeIds.has(createNodeId("".concat(typePrefix.toLowerCase(), "-entry-").concat(entry, "-").concat(locale)))) {
      reference.push(createNodeId("".concat(typePrefix.toLowerCase(), "-entry-").concat(entry, "-").concat(locale)));
    }
  });
  return reference;
};
var normalizeFileField = function normalizeFileField(value, locale, assetsNodeIds, createNodeId, typePrefix) {
  var reference = {};
  if (Array.isArray(value)) {
    reference = [];
    value.forEach(function (assetUid) {
      var nodeId = createNodeId("".concat(typePrefix.toLowerCase(), "-assets-").concat(assetUid, "-").concat(locale));
      if (assetsNodeIds.has(nodeId)) {
        reference.push(nodeId);
      }
    });
  } else if (assetsNodeIds.has(createNodeId("".concat(typePrefix.toLowerCase(), "-assets-").concat(value, "-").concat(locale)))) {
    reference = createNodeId("".concat(typePrefix.toLowerCase(), "-assets-").concat(value, "-").concat(locale));
  } else {
    // when the asset is not published
    reference = null;
  }
  return reference;
};
var getSchemaValue = function getSchemaValue(obj, key) {
  if (obj === null) return null;
  if ((0, _typeof2["default"])(obj) !== 'object') return null;
  return Object.prototype.hasOwnProperty.call(obj, key.uid) ? obj[key.uid] : null;
};
var builtEntry = function builtEntry(schema, entry, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix, configOptions) {
  var entryObj = {};
  schema.forEach(function (field) {
    var value = getSchemaValue(entry, field);
    switch (field.data_type) {
      case 'reference':
        entryObj["".concat(field.uid, "___NODE")] = value && normalizeReferenceField(value, locale, entriesNodeIds, createNodeId, typePrefix);
        break;
      case 'file':
        if (!value) value = null;
        entryObj["".concat(field.uid, "___NODE")] = value && normalizeFileField(value, locale, assetsNodeIds, createNodeId, typePrefix);
        break;
      case 'group':
      case 'global_field':
        entryObj[field.uid] = normalizeGroup(field, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix, configOptions);
        break;
      case 'blocks':
        entryObj[field.uid] = normalizeModularBlock(field.blocks, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix, configOptions);
        break;
      case 'json':
        entryObj[field.uid] = value;
        break;
      default:
        entryObj[field.uid] = value;
    }
  });
  return entryObj;
};
var buildBlockCustomSchema = function buildBlockCustomSchema(blocks, types, references, groups, fileFields, jsonRteFields, parent, prefix, disableMandatoryFields, jsonRteToHtml, createNodeId, interfaceParent) {
  var blockFields = {};
  var blockType = interfaceParent ? "type ".concat(parent, " implements ").concat(interfaceParent, " @infer {") : "type ".concat(parent, " @infer {");
  var blockInterface = interfaceParent && "interface ".concat(interfaceParent, " {");
  blocks.forEach(function (block) {
    var newparent = parent.concat(block.uid);
    // If this block has a reference_to, it is a global field and should have a new interface
    var newInterfaceParent = block.reference_to ? "".concat(prefix, "_").concat(block.reference_to) : interfaceParent && interfaceParent.concat(block.uid);
    blockType = blockType.concat("".concat(block.uid, " : ").concat(newparent, " "));
    blockInterface = blockInterface && blockInterface.concat("".concat(block.uid, " : ").concat(newInterfaceParent, " "));
    var _buildCustomSchema = buildCustomSchema(block.schema, types, references, groups, fileFields, jsonRteFields, newparent, prefix, disableMandatoryFields, jsonRteToHtml, createNodeId, newInterfaceParent),
      fields = _buildCustomSchema.fields;
    var typeFields = {};
    var interfaceFields = {};
    for (var key in fields) {
      typeFields[key] = fields[key].type || fields[key];
      interfaceFields[key] = typeFields[key].replace(newparent, newInterfaceParent);
    }
    if (Object.keys(fields).length > 0) {
      if (newInterfaceParent) {
        var interfaceType = "interface ".concat(newInterfaceParent, " ").concat(JSON.stringify(interfaceFields).replace(/"/g, ''));
        var type = "type ".concat(newparent, " implements ").concat(newInterfaceParent, " @infer ").concat(JSON.stringify(typeFields).replace(/"/g, ''));
        types.push(interfaceType, type);
      } else {
        var _type = "type ".concat(newparent, " @infer ").concat(JSON.stringify(typeFields).replace(/"/g, ''));
        types.push(_type);
      }
      blockFields[block.uid] = "".concat(newparent);
    }
  });
  blockType = blockType.concat('}');
  blockInterface = blockInterface && blockInterface.concat('}');
  return blockInterface ? [blockInterface, blockType] : [blockType];
};
exports.extendSchemaWithDefaultEntryFields = function (schema) {
  schema.push({
    data_type: 'text',
    uid: 'uid',
    multiple: false,
    mandatory: false
  });
  schema.push({
    data_type: 'text',
    uid: 'locale',
    multiple: false,
    mandatory: false
  });
  schema.push({
    data_type: 'group',
    uid: 'publish_details',
    schema: [{
      data_type: 'text',
      uid: 'locale',
      multiple: false,
      mandatory: false
    }],
    multiple: false,
    mandatory: false
  });
  schema.push({
    data_type: 'isodate',
    uid: 'updated_at',
    multiple: false,
    mandatory: false
  });
  schema.push({
    data_type: 'string',
    uid: 'updated_by',
    multiple: false,
    mandatory: false
  });
  schema.push({
    data_type: 'isodate',
    uid: 'created_at',
    multiple: false,
    mandatory: false
  });
  schema.push({
    data_type: 'string',
    uid: 'created_by',
    multiple: false,
    mandatory: false
  });
  return schema;
};
var buildCustomSchema = exports.buildCustomSchema = function (schema, types, references, groups, fileFields, jsonRteFields, parent, prefix, disableMandatoryFields, jsonRteToHtml, createNodeId, interfaceParent) {
  var fields = {};
  groups = groups || [];
  references = references || [];
  fileFields = fileFields || [];
  types = types || [];
  jsonRteFields = jsonRteFields || [];
  schema.forEach(function (field) {
    var _types;
    switch (field.data_type) {
      case 'text':
        fields[field.uid] = {
          resolve: function resolve(source) {
            return source[field.uid] || null;
          }
        };
        if (field.mandatory && !disableMandatoryFields) {
          if (field.multiple) {
            fields[field.uid].type = '[String]!';
          } else {
            fields[field.uid].type = 'String!';
          }
        } else if (field.multiple) {
          fields[field.uid].type = '[String]';
        } else {
          fields[field.uid].type = 'String';
        }
        break;
      case 'isodate':
        if (field.mandatory && !disableMandatoryFields) {
          if (field.multiple) {
            fields[field.uid] = {
              type: '[Date]!'
            };
          } else {
            fields[field.uid] = {
              type: 'Date!'
            };
          }
        } else if (field.multiple) {
          fields[field.uid] = {
            type: '[Date]'
          };
        } else {
          fields[field.uid] = {
            type: 'Date'
          };
        }
        fields[field.uid].extensions = {
          dateformat: {}
        };
        break;
      case 'boolean':
        if (field.mandatory && !disableMandatoryFields) {
          if (field.multiple) {
            fields[field.uid] = '[Boolean]!';
          } else {
            fields[field.uid] = 'Boolean!';
          }
        } else if (field.multiple) {
          fields[field.uid] = '[Boolean]';
        } else {
          fields[field.uid] = 'Boolean';
        }
        break;
      case 'number':
        fields[field.uid] = {
          resolve: function resolve(source) {
            return source[field.uid] || null;
          }
        };
        if (field.mandatory && !disableMandatoryFields) {
          if (field.multiple) {
            fields[field.uid].type = '[Float]!';
          } else {
            fields[field.uid].type = 'Float!';
          }
        } else if (field.multiple) {
          fields[field.uid].type = '[Float]';
        } else {
          fields[field.uid].type = 'Float';
        }
        break;
      // This is to support custom field types nested inside groups, global_fields & modular_blocks
      case 'json':
        if (getJSONToHtmlRequired(jsonRteToHtml, field)) {
          jsonRteFields.push({
            parent: parent,
            field: field
          });
          if (field.mandatory && !disableMandatoryFields) {
            if (field.multiple) {
              fields[field.uid] = '[String]!';
            } else {
              fields[field.uid] = 'String!';
            }
          } else if (field.multiple) {
            fields[field.uid] = '[String]';
          } else {
            fields[field.uid] = 'String';
          }
        } else {
          fields[field.uid] = {
            resolve: function resolve(source) {
              return source[field.uid] || null;
            }
          };
          if (field.mandatory && !disableMandatoryFields) {
            if (field.multiple) {
              fields[field.uid].type = '[JSON]!';
            } else {
              fields[field.uid].type = 'JSON!';
            }
          } else if (field.multiple) {
            fields[field.uid].type = '[JSON]';
          } else {
            fields[field.uid].type = 'JSON';
          }
        }
        break;
      case 'link':
        if (field.mandatory && !disableMandatoryFields) {
          if (field.multiple) {
            fields[field.uid] = '[linktype]!';
          } else {
            fields[field.uid] = 'linktype!';
          }
        } else if (field.multiple) {
          fields[field.uid] = '[linktype]';
        } else {
          fields[field.uid] = 'linktype';
        }
        break;
      case 'file':
        fileFields.push({
          parent: parent,
          field: field
        });
        if (field.mandatory && !disableMandatoryFields) {
          if (field.multiple) {
            fields[field.uid] = "[".concat(prefix, "_assets]!");
          } else {
            fields[field.uid] = "".concat(prefix, "_assets!");
          }
        } else if (field.multiple) {
          fields[field.uid] = "[".concat(prefix, "_assets]");
        } else {
          fields[field.uid] = "".concat(prefix, "_assets");
        }
        break;
      case 'group':
      case 'global_field':
        var newParent = parent.concat('_', field.uid);
        // If this is a global field, generate a new top-level interface for it
        var newInterfaceParent = field.data_type === 'global_field' ? "".concat(prefix, "_").concat(field.reference_to) : interfaceParent && interfaceParent.concat('_', field.uid);
        var result = buildCustomSchema(field.schema, types, references, groups, fileFields, jsonRteFields, newParent, prefix, disableMandatoryFields, jsonRteToHtml, createNodeId, newInterfaceParent);
        var typeFields = {};
        var interfaceFields = {};
        for (var key in result.fields) {
          typeFields[key] = result.fields[key].type || result.fields[key];
          interfaceFields[key] = typeFields[key].replace(newParent, newInterfaceParent);
        }
        if (Object.keys(typeFields).length > 0) {
          if (newInterfaceParent) {
            var interfaceType = "interface ".concat(newInterfaceParent, " ").concat(JSON.stringify(interfaceFields).replace(/"/g, ''));
            var type = "type ".concat(newParent, " implements ").concat(newInterfaceParent, " @infer ").concat(JSON.stringify(typeFields).replace(/"/g, ''));
            types.push(interfaceType, type);
          } else {
            var _type2 = "type ".concat(newParent, " @infer ").concat(JSON.stringify(typeFields).replace(/"/g, ''));
            types.push(_type2);
          }
          groups.push({
            parent: parent,
            field: field
          });
          if (field.mandatory && !disableMandatoryFields) {
            if (field.multiple) {
              fields[field.uid] = "[".concat(newParent, "]!");
            } else {
              fields[field.uid] = "".concat(newParent, "!");
            }
          } else if (field.multiple) {
            fields[field.uid] = "[".concat(newParent, "]");
          } else {
            fields[field.uid] = "".concat(newParent);
          }
        }
        break;
      case 'blocks':
        var blockParent = parent.concat('_', field.uid);
        var blockInterfaceParent = interfaceParent && interfaceParent.concat('_', field.uid);
        var blockTypes = buildBlockCustomSchema(field.blocks, types, references, groups, fileFields, jsonRteFields, blockParent, prefix, disableMandatoryFields, jsonRteToHtml, createNodeId, blockInterfaceParent);
        (_types = types).push.apply(_types, (0, _toConsumableArray2["default"])(blockTypes));
        if (field.mandatory && !disableMandatoryFields) {
          if (field.multiple) {
            fields[field.uid] = "[".concat(blockParent, "]!");
          } else {
            fields[field.uid] = "".concat(blockParent, "!");
          }
        } else if (field.multiple) {
          fields[field.uid] = "[".concat(blockParent, "]");
        } else {
          fields[field.uid] = "".concat(blockParent);
        }
        break;
      case 'reference':
        var unionType = 'union ';
        if (typeof field.reference_to === 'string' || field.reference_to.length === 1) {
          field.reference_to = Array.isArray(field.reference_to) ? field.reference_to[0] : field.reference_to;
          var _type3 = "type ".concat(prefix, "_").concat(field.reference_to, " implements Node @infer { title: String").concat(disableMandatoryFields ? '' : '!', " }");
          types.push(_type3);
          references.push({
            parent: parent,
            uid: field.uid
          });
          if (field.mandatory && !disableMandatoryFields) {
            fields[field.uid] = "[".concat(prefix, "_").concat(field.reference_to, "]!");
          } else {
            fields[field.uid] = "[".concat(prefix, "_").concat(field.reference_to, "]");
          }
        } else {
          var unions = [];
          field.reference_to.forEach(function (reference) {
            var referenceType = "".concat(prefix, "_").concat(reference);
            unionType = unionType.concat(referenceType);
            unions.push(referenceType);
            var type = "type ".concat(referenceType, " implements Node @infer { title: String").concat(disableMandatoryFields ? '' : '!', " }");
            types.push(type);
          });
          var name = '';
          name = name.concat(unions.join(''), '_Union');
          unionType = unionType.concat('_Union = ', unions.join(' | '));
          types.push(unionType);
          references.push({
            parent: parent,
            uid: field.uid
          });
          if (field.mandatory && !disableMandatoryFields) {
            fields[field.uid] = "[".concat(name, "]!");
          } else {
            fields[field.uid] = "[".concat(name, "]");
          }
        }
        break;
    }
  });
  return {
    fields: fields,
    types: types,
    references: references,
    groups: groups,
    fileFields: fileFields,
    jsonRteFields: jsonRteFields
  };
};
//# sourceMappingURL=normalize.js.map