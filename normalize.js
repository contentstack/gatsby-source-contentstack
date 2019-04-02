"use strict";

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ = require("lodash");
var crypto = require("crypto");
var Contentstack = require("contentstack");
var _process$env = process.env,
    ACTIVE_ENV = _process$env.ACTIVE_ENV,
    NODE_ENV = _process$env.NODE_ENV;

var activeEnv = ACTIVE_ENV || NODE_ENV || "development";
require("dotenv").config({ path: ".env." + activeEnv });

var apiKey = process.env.CONTENTSTACK_API_KEY;
var apiToken = process.env.CONTENTSTACK_ACCESS_TOKEN;
var environment = process.env.CONTENTSTACK_ENVIRONMENT;
var Stack = Contentstack.Stack(apiKey, apiToken, environment);

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

var getParentId = function getParentId(entry) {
  if (!Array.isArray(entry.page_parent)) return false;
  return entry.page_parent[0];
};

exports.normalizeEntry = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(contentType, entry, entries, createNodeId) {
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt("return", new _promise2.default(function () {
              var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(resolve) {
                var parentUrl, locale, parentId, pageSlug, response;
                return _regenerator2.default.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        parentUrl = void 0;
                        locale = _.get(entry, "publish_details.locale", false);
                        parentId = getParentId(entry, false);
                        pageSlug = _.get(entry, "url", null);

                        if (!(parentId && locale)) {
                          _context.next = 9;
                          break;
                        }

                        _context.next = 7;
                        return Stack.ContentType("page").Entry(parentId).language(locale).fetch();

                      case 7:
                        response = _context.sent;


                        parentUrl = response.get("url");

                      case 9:

                        if (pageSlug) {
                          entry.url = parentUrl ? "/" + locale + parentUrl + pageSlug : "/" + locale + pageSlug;
                        }

                        resolve((0, _assign2.default)({}, entry, builtEntry(contentType.schema, entry, entry.publish_details.locale, entries, createNodeId)));

                        return _context.abrupt("return", null);

                      case 12:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee, undefined);
              }));

              return function (_x5) {
                return _ref2.apply(this, arguments);
              };
            }()));

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function (_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();

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