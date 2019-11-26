'use strict';

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.processContentType = function (content_type, createNodeId, createContentDigest) {
    var nodeId = createNodeId('contentstack-contentType-' + content_type.uid);
    var nodeContent = (0, _stringify2.default)(content_type);
    var nodeData = (0, _assign2.default)({}, content_type, {
        id: nodeId,
        parent: null,
        children: [],
        internal: {
            type: 'ContentstackContentTypes',
            content: nodeContent,
            contentDigest: createContentDigest(nodeContent)
        }
    });
    return nodeData;
};

exports.processAsset = function (asset, createNodeId, createContentDigest) {
    var nodeId = makeAssetNodeUid(asset, createNodeId);
    var nodeContent = (0, _stringify2.default)(asset);
    var nodeData = (0, _assign2.default)({}, asset, {
        id: nodeId,
        parent: null,
        children: [],
        internal: {
            type: 'Contentstack_assets',
            content: nodeContent,
            contentDigest: createContentDigest(nodeContent)
        }
    });
    return nodeData;
};

exports.processEntry = function (content_type, entry, createNodeId, createContentDigest) {
    var nodeId = makeEntryNodeUid(entry, createNodeId);
    var nodeContent = (0, _stringify2.default)(entry);
    var nodeData = (0, _assign2.default)({}, entry, {
        id: nodeId,
        parent: null,
        children: [],
        internal: {
            type: 'Contentstack_' + content_type.uid,
            content: nodeContent,
            contentDigest: createContentDigest(nodeContent)
        }
    });
    return nodeData;
};

exports.normalizeEntry = function (contentType, entry, entriesNodeIds, assetsNodeIds, createNodeId) {
    var resolveEntry = (0, _assign2.default)({}, entry, builtEntry(contentType.schema, entry, entry.publish_details.locale, entriesNodeIds, assetsNodeIds, createNodeId));
    return resolveEntry;
};

var makeAssetNodeUid = exports.makeAssetNodeUid = function (asset, createNodeId) {
    var publishedLocale = asset.publish_details.locale;
    return createNodeId('contentstack-assets-' + asset.uid + '-' + publishedLocale);
};

var makeEntryNodeUid = exports.makeEntryNodeUid = function (entry, createNodeId) {
    var publishedLocale = entry.publish_details.locale;
    return createNodeId('contentstack-entry-' + entry.uid + '-' + publishedLocale);
};

var normalizeGroup = function normalizeGroup(field, value, locale, entriesNodeIds, assetsNodeIds, createNodeId) {
    var groupObj = null;
    if (field.multiple && value instanceof Array) {
        groupObj = [];
        value.forEach(function (groupValue) {
            groupObj.push(builtEntry(field.schema, groupValue, locale, entriesNodeIds, assetsNodeIds, createNodeId));
        });
    } else {
        groupObj = {};
        groupObj = builtEntry(field.schema, value, locale, entriesNodeIds, assetsNodeIds, createNodeId);
    }
    return groupObj;
};

var normalizeModularBlock = function normalizeModularBlock(blocks, value, locale, entriesNodeIds, assetsNodeIds, createNodeId) {
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
                blockObj[key] = builtEntry(blockSchema[0].schema, block[key], locale, entriesNodeIds, assetsNodeIds, createNodeId);
                modularBlocksObj.push(blockObj);
            });
        });
    }
    return modularBlocksObj;
};

var normalizeReferenceField = function normalizeReferenceField(value, locale, entriesNodeIds, createNodeId) {
    var reference = [];
    value.forEach(function (entry) {
        if ((typeof entry === 'undefined' ? 'undefined' : (0, _typeof3.default)(entry)) === "object" && entry.uid) {
            if (entriesNodeIds.has(createNodeId('contentstack-entry-' + entry.uid + '-' + locale))) {
                reference.push(createNodeId('contentstack-entry-' + entry.uid + '-' + locale));
            }
        } else {
            if (entriesNodeIds.has(createNodeId('contentstack-entry-' + entry + '-' + locale))) {
                reference.push(createNodeId('contentstack-entry-' + entry + '-' + locale));
            }
        }
    });
    return reference;
};

var normalizeFileField = function normalizeFileField(value, locale, assetsNodeIds, createNodeId) {
    var reference = {};
    if (Array.isArray(value)) {
        reference = [];
        value.forEach(function (assetUid) {
            if (assetsNodeIds.has(createNodeId('contentstack-assets-' + assetUid + '-' + locale))) {
                reference.push(createNodeId('contentstack-assets-' + assetUid + '-' + locale));
            }
        });
    } else {
        if (assetsNodeIds.has(createNodeId('contentstack-assets-' + value + '-' + locale))) {
            reference = createNodeId('contentstack-assets-' + value + '-' + locale);
        }
    }
    return reference;
};

var normalizeMarkdown2Html = function normalizeMarkdown2Html(value) {
    var remark = require('remark');
    var guide = require('remark-preset-lint-markdown-style-guide');
    var html = require('remark-html');

    var md2html = {};
    remark().use(guide).use(html).process(value, function (err, data) {
        md2html = {
            markdown: value,
            html: String(data)
        };
    });
    return md2html;
};

var getSchemaValue = function getSchemaValue(obj, key) {
    if (obj === null) return null;
    if ((typeof obj === 'undefined' ? 'undefined' : (0, _typeof3.default)(obj)) !== "object") return null;
    return obj.hasOwnProperty(key.uid) ? obj[key.uid] : null;
};

var builtEntry = function builtEntry(schema, entry, locale, entriesNodeIds, assetsNodeIds, createNodeId) {
    var entryObj = {};
    schema.forEach(function (field) {
        var value = getSchemaValue(entry, field);
        switch (field.data_type) {
            case "reference":
                entryObj[field.uid + '___NODE'] = value && normalizeReferenceField(value, locale, entriesNodeIds, createNodeId);
                break;
            case "file":
                entryObj[field.uid + '___NODE'] = value && normalizeFileField(value, locale, assetsNodeIds, createNodeId);
                break;
            case "group":
            case "global_field":
                entryObj[field.uid] = normalizeGroup(field, value, locale, entriesNodeIds, assetsNodeIds, createNodeId);
                break;
            case "blocks":
                entryObj[field.uid] = normalizeModularBlock(field.blocks, value, locale, entriesNodeIds, assetsNodeIds, createNodeId);
                break;
            case "text":
                if (field.field_metadata && field.field_metadata.markdown && value) {
                    entryObj[field.uid] = normalizeMarkdown2Html(value);
                } else {
                    entryObj[field.uid] = value;
                }
                break;
            default:
                entryObj[field.uid] = value;
        }
    });
    return entryObj;
};