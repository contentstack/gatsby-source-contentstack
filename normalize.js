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

var _ = require("lodash");
var crypto = require("crypto");

var _require = require("asyncro"),
    map = _require.map,
    reduce = _require.reduce,
    parallel = _require.parallel;

exports.processContentType = function (content_type, createNodeId) {
  var nodeId = createNodeId("contentstack-contentType-" + content_type.uid);
  var nodeContent = (0, _stringify2.default)(content_type);
  var nodeContentDigest = crypto.createHash("md5").update(nodeContent).digest("hex");
  var nodeData = (0, _assign2.default)({}, content_type, {
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: "ContentstackContentTypes",
      content: nodeContent,
      contentDigest: nodeContentDigest
    }
  });
  return nodeData;
};

exports.processEntry = function (content_type, entry, createNodeId) {
  var nodeId = makeEntryNodeUid(entry, createNodeId);
  var nodeContent = (0, _stringify2.default)(entry);
  var nodeContentDigest = crypto.createHash("md5").update(nodeContent).digest("hex");
  var nodeData = (0, _assign2.default)({}, entry, {
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: "Contentstack_" + content_type.uid,
      content: nodeContent,
      contentDigest: nodeContentDigest
    }
  });
  return nodeData;
};

exports.normalizeEntry = function (contentType, entry, entries, createNodeId) {
  var resolveEntry = (0, _assign2.default)({}, entry, builtEntry(contentType.schema, entry, entry.publish_details.locale, entries, createNodeId));
  return resolveEntry;
};

var makeEntryNodeUid = function makeEntryNodeUid(entry, createNodeId) {
  var publishedLocale = null;
  if (entry && entry.publish_details) {
    if (Array.isArray(entry.publish_details)) {
      publishedLocale = entry.publish_details[0].locale;
    } else {
      publishedLocale = entry.publish_details.locale;
    }
  }
  return createNodeId("contentstack-entry-" + entry.uid + "-" + publishedLocale);
};

var normalizeGroup = function normalizeGroup(field, value, locale, entries, createNodeId) {
  var groupObj = null;
  if (field.multiple && value instanceof Array) {
    groupObj = [];
    value.forEach(function (groupValue) {
      groupObj.push(builtEntry(field.schema, groupValue, locale, entries, createNodeId));
    });
  } else {
    groupObj = {};
    groupObj = builtEntry(field.schema, value, locale, entries, createNodeId);
  }
  return groupObj;
};

var normalizeModularBlock = function normalizeModularBlock(blocks, value, locale, entries, createNodeId) {
  if (!Array.isArray(value)) return [];

  var modularBlocksObj = [];
  value.map(function (block) {
    (0, _keys2.default)(block).forEach(function (key) {
      var blockSchema = blocks.filter(function (block) {
        return block.uid === key;
      });
      var blockObj = {};
      blockObj[key] = builtEntry(blockSchema[0] && blockSchema[0].schema, block[key], locale, entries, createNodeId);
      modularBlocksObj.push(blockObj);
    });
  });
  return modularBlocksObj;
};

var normalizeReferenceField = function normalizeReferenceField(value, referenceTo, locale, entries, createNodeId) {
  var reference = [];
  if (Array.isArray(value)) {
    value.forEach(function (entryUid) {
      try {
        var nonLocalizedEntries = _.filter(entries, function (entry) {
          return entry.uid === entryUid;
        }) || [];
        nonLocalizedEntries.forEach(function (entry) {
          var publishedLocale = null;
          if (entry && entry.publish_details) {
            if (Array.isArray(entry.publish_details)) {
              publishedLocale = entry.publish_details[0].locale;
            } else {
              publishedLocale = entry.publish_details.locale;
            }
          }
          if (publishedLocale === locale) {
            reference.push(createNodeId("contentstack-entry-" + entryUid + "-" + publishedLocale));
          }
        });
      } catch (e) {
        console.log(e);
      }
    });
  }
  return reference;
};

var getValue = function getValue(obj, key) {
  if (obj === null) return null;
  if ((typeof obj === "undefined" ? "undefined" : (0, _typeof3.default)(obj)) !== "object") return null;
  return obj.hasOwnProperty(key.uid) ? obj[key.uid] : null;
};

var builtEntry = function builtEntry(schema, entry, locale, entries, createNodeId) {
  var entryObj = {};
  if (schema) {
    schema.forEach(function (field) {
      var value = getValue(entry, field);

      switch (field.data_type) {
        case "reference":
          entryObj[field.uid + "___NODE"] = value && normalizeReferenceField(value, field.reference_to, locale, entries[field.reference_to], createNodeId);
          break;
        case "group":
          entryObj[field.uid] = normalizeGroup(field, value, locale, entries, createNodeId);
          break;
        case "blocks":
          entryObj[field.uid] = normalizeModularBlock(field.blocks, value, locale, entries, createNodeId);
          break;
        default:
          entryObj[field.uid] = value;
      }
    });
  }
  return entryObj;
};