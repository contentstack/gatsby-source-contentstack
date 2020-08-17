'use strict';

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.processContentType = function (contentType, createNodeId, createContentDigest, typePrefix) {
  var nodeId = createNodeId(typePrefix.toLowerCase() + '-contentType-' + contentType.uid);
  var nodeContent = (0, _stringify2.default)(contentType);
  var nodeData = (0, _extends3.default)({}, contentType, {
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: typePrefix + 'ContentTypes',
      content: nodeContent,
      contentDigest: createContentDigest(nodeContent)
    }
  });
  return nodeData;
};

exports.processAsset = function (asset, createNodeId, createContentDigest, typePrefix) {
  var nodeId = makeAssetNodeUid(asset, createNodeId, typePrefix);
  var nodeContent = (0, _stringify2.default)(asset);
  var nodeData = (0, _extends3.default)({}, asset, {
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: typePrefix + '_assets',
      content: nodeContent,
      contentDigest: createContentDigest(nodeContent)
    }
  });
  return nodeData;
};

exports.processEntry = function (contentType, entry, createNodeId, createContentDigest, typePrefix) {
  var nodeId = makeEntryNodeUid(entry, createNodeId, typePrefix);
  var nodeContent = (0, _stringify2.default)(entry);
  var nodeData = (0, _extends3.default)({}, entry, {
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: typePrefix + '_' + contentType.uid,
      content: nodeContent,
      contentDigest: createContentDigest(nodeContent)
    }
  });
  return nodeData;
};

exports.normalizeEntry = function (contentType, entry, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix) {
  var resolveEntry = (0, _extends3.default)({}, entry, builtEntry(contentType.schema, entry, entry.publish_details.locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix));
  return resolveEntry;
};

var makeAssetNodeUid = exports.makeAssetNodeUid = function (asset, createNodeId, typePrefix) {
  var publishedLocale = asset.publish_details.locale;
  return createNodeId(typePrefix.toLowerCase() + '-assets-' + asset.uid + '-' + publishedLocale);
};

var makeEntryNodeUid = exports.makeEntryNodeUid = function (entry, createNodeId, typePrefix) {
  var publishedLocale = entry.publish_details.locale;
  return createNodeId(typePrefix.toLowerCase() + '-entry-' + entry.uid + '-' + publishedLocale);
};

var normalizeGroup = function normalizeGroup(field, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix) {
  var groupObj = null;
  if (field.multiple && value instanceof Array) {
    groupObj = [];
    value.forEach(function (groupValue) {
      groupObj.push(builtEntry(field.schema, groupValue, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix));
    });
  } else {
    groupObj = {};
    groupObj = builtEntry(field.schema, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix);
  }
  return groupObj;
};

var normalizeModularBlock = function normalizeModularBlock(blocks, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix) {
  var modularBlocksObj = [];
  if (value) {
    value.map(function (block) {
      (0, _keys2.default)(block).forEach(function (key) {
        var blockSchema = blocks.filter(function (block) {
          return block.uid === key;
        });
        if (!blockSchema.length) {
          // block value no longer exists block schema so ignore it
          return;
        }
        var blockObj = {};
        blockObj[key] = builtEntry(blockSchema[0].schema, block[key], locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix);
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
    if ((typeof entry === 'undefined' ? 'undefined' : (0, _typeof3.default)(entry)) === 'object' && entry.uid) {
      if (entriesNodeIds.has(createNodeId(typePrefix.toLowerCase() + '-entry-' + entry.uid + '-' + locale))) {
        reference.push(createNodeId(typePrefix.toLowerCase() + '-entry-' + entry.uid + '-' + locale));
      }
    } else if (entriesNodeIds.has(createNodeId(typePrefix.toLowerCase() + '-entry-' + entry + '-' + locale))) {
      reference.push(createNodeId(typePrefix.toLowerCase() + '-entry-' + entry + '-' + locale));
    }
  });
  return reference;
};

var normalizeFileField = function normalizeFileField(value, locale, assetsNodeIds, createNodeId, typePrefix) {
  var reference = {};
  if (Array.isArray(value)) {
    reference = [];
    value.forEach(function (assetUid) {
      if (assetsNodeIds.has(createNodeId(typePrefix.toLowerCase() + '-assets-' + assetUid + '-' + locale))) {
        reference.push(createNodeId(typePrefix.toLowerCase() + '-assets-' + assetUid + '-' + locale));
      }
    });
  } else if (assetsNodeIds.has(createNodeId(typePrefix.toLowerCase() + '-assets-' + value + '-' + locale))) {
    reference = createNodeId(typePrefix.toLowerCase() + '-assets-' + value + '-' + locale);
  }
  return reference;
};

var getSchemaValue = function getSchemaValue(obj, key) {
  if (obj === null) return null;
  if ((typeof obj === 'undefined' ? 'undefined' : (0, _typeof3.default)(obj)) !== 'object') return null;
  return Object.prototype.hasOwnProperty.call(obj, key.uid) ? obj[key.uid] : null;
};

var builtEntry = function builtEntry(schema, entry, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix) {
  var entryObj = {};
  schema.forEach(function (field) {
    var value = getSchemaValue(entry, field);
    switch (field.data_type) {
      case 'reference':
        entryObj[field.uid + '___NODE'] = value && normalizeReferenceField(value, locale, entriesNodeIds, createNodeId, typePrefix);
        break;
      case 'file':
        entryObj[field.uid + '___NODE'] = value && normalizeFileField(value, locale, assetsNodeIds, createNodeId, typePrefix);
        break;
      case 'group':
      case 'global_field':
        entryObj[field.uid] = normalizeGroup(field, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix);
        break;
      case 'blocks':
        entryObj[field.uid] = normalizeModularBlock(field.blocks, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix);
        break;
      default:
        entryObj[field.uid] = value;
    }
  });
  return entryObj;
};

var buildBlockCustomSchema = function buildBlockCustomSchema(blocks, types, references, groups, parent, prefix) {
  var blockFields = {};
  var blockType = 'type ' + parent + ' {';
  blocks.forEach(function (block) {
    var newparent = parent.concat(block.uid);
    blockType = blockType.concat(block.uid + ' : ' + newparent + ' ');

    var _buildCustomSchema = buildCustomSchema(block.schema, types, references, groups, newparent, prefix),
        fields = _buildCustomSchema.fields;

    for (var key in fields) {
      if (Object.prototype.hasOwnProperty.call(fields[key], 'type')) {
        fields[key] = fields[key].type;
      }
    }
    if ((0, _keys2.default)(fields).length > 0) {
      var type = 'type ' + newparent + ' ' + (0, _stringify2.default)(fields).replace(/"/g, '');
      types.push(type);
      blockFields[block.uid] = '' + newparent;
    }
  });
  blockType = blockType.concat('}');
  return blockType;
};

var buildCustomSchema = exports.buildCustomSchema = function (schema, types, references, groups, parent, prefix) {
  var fields = {};
  groups = groups || [];
  references = references || [];
  types = types || [];
  schema.forEach(function (field) {
    switch (field.data_type) {
      case 'text':
        fields[field.uid] = {
          resolve: function resolve(source) {
            return source[field.uid] || null;
          }
        };
        if (field.mandatory) {
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
        if (field.mandatory) {
          if (field.multiple) {
            fields[field.uid] = '[Date]!';
          } else {
            fields[field.uid] = 'Date!';
          }
        } else if (field.multiple) {
          fields[field.uid] = '[Date]';
        } else {
          fields[field.uid] = 'Date';
        }
        break;
      case 'boolean':
        if (field.mandatory) {
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
        if (field.mandatory) {
          if (field.multiple) {
            fields[field.uid].type = '[Int]!';
          } else {
            fields[field.uid].type = 'Int!';
          }
        } else if (field.multiple) {
          fields[field.uid].type = '[Int]';
        } else {
          fields[field.uid].type = 'Int';
        }
        break;
      case 'link':
        if (field.mandatory) {
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
        var type = 'type ' + prefix + '_assets implements Node { url: String }';
        types.push(type);
        fields[field.uid] = {
          resolve: function resolve(source, args, context) {
            if (field.multiple && source[field.uid + '___NODE']) {
              var nodesData = [];
              context.nodeModel.getAllNodes({
                type: prefix + '_assets'
              }).find(function (node) {
                source[field.uid + '___NODE'].forEach(function (id) {
                  if (node.id === id) {
                    nodesData.push(node);
                  }
                });
              });
              return nodesData;
            }

            if (source[field.uid + '___NODE']) {
              return context.nodeModel.getAllNodes({
                type: prefix + '_assets'
              }).find(function (node) {
                return node.id === source[field.uid + '___NODE'];
              });
            }
            return null;
          }
        };
        if (field.mandatory) {
          if (field.multiple) {
            fields[field.uid].type = '[' + prefix + '_assets]!';
          } else {
            fields[field.uid].type = prefix + '_assets!';
          }
        } else if (field.multiple) {
          fields[field.uid].type = '[' + prefix + '_assets]';
        } else {
          fields[field.uid].type = prefix + '_assets';
        }
        break;
      case 'group':
      case 'global_field':
        var newparent = parent.concat('_', field.uid);
        var result = buildCustomSchema(field.schema, types, references, groups, newparent, prefix);

        for (var key in result.fields) {
          if (Object.prototype.hasOwnProperty.call(result.fields[key], 'type')) {
            result.fields[key] = result.fields[key].type;
          }
        }
        if ((0, _keys2.default)(result.fields).length > 0) {
          var _type = 'type ' + newparent + ' ' + (0, _stringify2.default)(result.fields).replace(/"/g, '');
          types.push(_type);

          groups.push({
            parent: parent,
            field: field
          });

          if (field.mandatory) {
            if (field.multiple) {
              fields[field.uid] = '[' + newparent + ']!';
            } else {
              fields[field.uid] = newparent + '!';
            }
          } else if (field.multiple) {
            fields[field.uid] = '[' + newparent + ']';
          } else {
            fields[field.uid] = '' + newparent;
          }
        }

        break;
      case 'blocks':
        var blockparent = parent.concat('_', field.uid);
        var blockType = buildBlockCustomSchema(field.blocks, types, references, groups, blockparent, prefix);
        types.push(blockType);
        if (field.mandatory) {
          if (field.multiple) {
            fields[field.uid] = '[' + blockparent + ']!';
          } else {
            fields[field.uid] = blockparent + '!';
          }
        } else if (field.multiple) {
          fields[field.uid] = '[' + blockparent + ']';
        } else {
          fields[field.uid] = '' + blockparent;
        }
        break;
      case 'reference':
        var unionType = 'union ';
        if (typeof field.reference_to === 'string' || field.reference_to.length === 1) {
          field.reference_to = Array.isArray(field.reference_to) ? field.reference_to[0] : field.reference_to;
          var _type2 = 'type ' + prefix + '_' + field.reference_to + ' implements Node { title: String! }';
          types.push(_type2);
          if (field.mandatory) {
            fields[field.uid] = '[' + prefix + '_' + field.reference_to + ']!';
          } else {
            fields[field.uid] = '[' + prefix + '_' + field.reference_to + ']';
          }
        } else {
          var unions = [];
          field.reference_to.forEach(function (reference) {
            var referenceType = prefix + '_' + reference;
            unionType = unionType.concat(referenceType);
            unions.push(referenceType);
            var type = 'type ' + referenceType + ' implements Node { title: String! }';
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

          if (field.mandatory) {
            fields[field.uid] = '[' + name + ']!';
          } else {
            fields[field.uid] = '[' + name + ']';
          }
        }
        break;
    }
  });
  return {
    fields: fields,
    types: types,
    references: references,
    groups: groups
  };
};