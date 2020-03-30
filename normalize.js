"use strict";

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.processContentType = function (content_type, createNodeId, createContentDigest, typePrefix) {
  var nodeId = createNodeId(typePrefix.toLowerCase() + "-contentType-" + content_type.uid);
  var nodeContent = (0, _stringify2.default)(content_type);
  var nodeData = (0, _assign2.default)({}, content_type, {
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: typePrefix + "ContentTypes",
      content: nodeContent,
      contentDigest: createContentDigest(nodeContent)
    }
  });
  return nodeData;
};

exports.processAsset = function (asset, createNodeId, createContentDigest, typePrefix) {
  var nodeId = makeAssetNodeUid(asset, createNodeId, typePrefix);
  var nodeContent = (0, _stringify2.default)(asset);
  var nodeData = (0, _assign2.default)({}, asset, {
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: typePrefix + "_assets",
      content: nodeContent,
      contentDigest: createContentDigest(nodeContent)
    }
  });
  return nodeData;
};

exports.processEntry = function (content_type, entry, createNodeId, createContentDigest, typePrefix) {
  var nodeId = makeEntryNodeUid(entry, createNodeId, typePrefix);
  var nodeContent = (0, _stringify2.default)(entry);
  var nodeData = (0, _assign2.default)({}, entry, {
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: typePrefix + "_" + content_type.uid,
      content: nodeContent,
      contentDigest: createContentDigest(nodeContent)
    }
  });
  return nodeData;
};

exports.normalizeEntry = function (contentType, entry, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix) {
  var resolveEntry = (0, _assign2.default)({}, entry, builtEntry(contentType.schema, entry, entry.publish_details.locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix));
  return resolveEntry;
};

var makeAssetNodeUid = exports.makeAssetNodeUid = function (asset, createNodeId, typePrefix) {
  var publishedLocale = asset.publish_details.locale;
  return createNodeId(typePrefix.toLowerCase() + "-assets-" + asset.uid + "-" + publishedLocale);
};

var makeEntryNodeUid = exports.makeEntryNodeUid = function (entry, createNodeId, typePrefix) {
  var publishedLocale = entry.publish_details.locale;
  return createNodeId(typePrefix.toLowerCase() + "-entry-" + entry.uid + "-" + publishedLocale);
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
    if ((typeof entry === "undefined" ? "undefined" : (0, _typeof3.default)(entry)) === "object" && entry.uid) {
      if (entriesNodeIds.has(createNodeId(typePrefix.toLowerCase() + "-entry-" + entry.uid + "-" + locale))) {
        reference.push(createNodeId(typePrefix.toLowerCase() + "-entry-" + entry.uid + "-" + locale));
      }
    } else {
      if (entriesNodeIds.has(createNodeId(typePrefix.toLowerCase() + "-entry-" + entry + "-" + locale))) {
        reference.push(createNodeId(typePrefix.toLowerCase() + "-entry-" + entry + "-" + locale));
      }
    }
  });
  return reference;
};

var normalizeFileField = function normalizeFileField(value, locale, assetsNodeIds, createNodeId, typePrefix) {
  var reference = {};
  if (Array.isArray(value)) {
    reference = [];
    value.forEach(function (assetUid) {
      if (assetsNodeIds.has(createNodeId(typePrefix.toLowerCase() + "-assets-" + assetUid + "-" + locale))) {
        reference.push(createNodeId(typePrefix.toLowerCase() + "-assets-" + assetUid + "-" + locale));
      }
    });
  } else {
    if (assetsNodeIds.has(createNodeId(typePrefix.toLowerCase() + "-assets-" + value + "-" + locale))) {
      reference = createNodeId(typePrefix.toLowerCase() + "-assets-" + value + "-" + locale);
    }
  }
  return reference;
};

var getSchemaValue = function getSchemaValue(obj, key) {
  if (obj === null) return null;
  if ((typeof obj === "undefined" ? "undefined" : (0, _typeof3.default)(obj)) !== "object") return null;
  return obj.hasOwnProperty(key.uid) ? obj[key.uid] : null;
};

var builtEntry = function builtEntry(schema, entry, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix) {
  var entryObj = {};
  schema.forEach(function (field) {
    var value = getSchemaValue(entry, field);
    switch (field.data_type) {
      case "reference":
        entryObj[field.uid + "___NODE"] = value && normalizeReferenceField(value, locale, entriesNodeIds, createNodeId, typePrefix);
        break;
      case "file":
        entryObj[field.uid + "___NODE"] = value && normalizeFileField(value, locale, assetsNodeIds, createNodeId, typePrefix);
        break;
      case "group":
      case "global_field":
        entryObj[field.uid] = normalizeGroup(field, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix);
        break;
      case "blocks":
        entryObj[field.uid] = normalizeModularBlock(field.blocks, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix);
        break;
      default:
        entryObj[field.uid] = value;
    }
  });
  return entryObj;
};