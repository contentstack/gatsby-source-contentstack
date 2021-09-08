"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var _require = require('./normalize'),
    normalizeEntry = _require.normalizeEntry,
    sanitizeEntry = _require.sanitizeEntry,
    processContentType = _require.processContentType,
    processEntry = _require.processEntry,
    processAsset = _require.processAsset,
    makeEntryNodeUid = _require.makeEntryNodeUid,
    makeAssetNodeUid = _require.makeAssetNodeUid,
    buildCustomSchema = _require.buildCustomSchema,
    extendSchemaWithDefaultEntryFields = _require.extendSchemaWithDefaultEntryFields;

var _require2 = require('./utils'),
    checkIfUnsupportedFormat = _require2.checkIfUnsupportedFormat,
    SUPPORTED_FILES_COUNT = _require2.SUPPORTED_FILES_COUNT,
    IMAGE_REGEXP = _require2.IMAGE_REGEXP,
    CODES = _require2.CODES;

var _require3 = require('./fetch'),
    fetchData = _require3.fetchData,
    fetchContentTypes = _require3.fetchContentTypes;

var downloadAssets = require('./download-assets');

var fetch = require('node-fetch');

var references = [];
var groups = [];
var fileFields = [];

exports.onPreBootstrap = function (_ref) {
  var reporter = _ref.reporter;
  var args = process.argv;

  if (args.includes('--verbose')) {
    reporter.setVerbose(true);
  }
};

exports.createSchemaCustomization = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(_ref3, configOptions) {
    var cache, actions, schema, contentTypes, typePrefix, disableMandatoryFields, createTypes, name, fields;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            cache = _ref3.cache, actions = _ref3.actions, schema = _ref3.schema;
            typePrefix = configOptions.type_prefix || 'Contentstack';
            disableMandatoryFields = configOptions.disableMandatoryFields || false;
            _context.prev = 3;
            _context.next = 6;
            return fetchContentTypes(configOptions);

          case 6:
            contentTypes = _context.sent;
            _context.next = 9;
            return cache.set(typePrefix, contentTypes);

          case 9:
            _context.next = 14;
            break;

          case 11:
            _context.prev = 11;
            _context.t0 = _context["catch"](3);
            console.error('Contentstack fetch content type failed!');

          case 14:
            if (configOptions.enableSchemaGeneration) {
              createTypes = actions.createTypes;
              contentTypes.forEach(function (contentType) {
                var contentTypeUid = contentType.uid.replace(/-/g, '_');
                var name = "".concat(typePrefix, "_").concat(contentTypeUid);
                var extendedSchema = extendSchemaWithDefaultEntryFields(contentType.schema);
                var result = buildCustomSchema(extendedSchema, [], [], [], [], name, typePrefix, disableMandatoryFields);
                references = references.concat(result.references);
                groups = groups.concat(result.groups);
                fileFields = fileFields.concat(result.fileFields);
                var typeDefs = ["type linktype{\n              title: String\n              href: String\n            }", schema.buildObjectType({
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
            }

          case 15:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[3, 11]]);
  }));

  return function (_x, _x2) {
    return _ref2.apply(this, arguments);
  };
}();

exports.sourceNodes = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(_ref5, configOptions) {
    var cache, actions, getNode, getNodes, createNodeId, store, reporter, createContentDigest, getNodesByType, getCache, createNode, deleteNode, touchNode, setPluginStatus, syncToken, _store$getState, status, typePrefix, _yield$fetchData, contentstackData, syncData, entriesNodeIds, assetsNodeIds, existingNodes, countOfSupportedFormatFiles, deleteContentstackNodes, nextSyncToken, newState;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            deleteContentstackNodes = function _deleteContentstackNo(item, type) {
              var nodeId = '';
              var node = null;

              if (type === 'entry') {
                nodeId = createNodeId("".concat(typePrefix.toLowerCase(), "-entry-").concat(item.uid, "-").concat(item.locale));
              }

              if (type === 'asset') {
                nodeId = createNodeId("".concat(typePrefix.toLowerCase(), "-assets-").concat(item.uid, "-").concat(item.locale));
              }

              node = getNode(nodeId);

              if (node) {
                deleteNode(node);
              }
            };

            cache = _ref5.cache, actions = _ref5.actions, getNode = _ref5.getNode, getNodes = _ref5.getNodes, createNodeId = _ref5.createNodeId, store = _ref5.store, reporter = _ref5.reporter, createContentDigest = _ref5.createContentDigest, getNodesByType = _ref5.getNodesByType, getCache = _ref5.getCache;
            createNode = actions.createNode, deleteNode = actions.deleteNode, touchNode = actions.touchNode, setPluginStatus = actions.setPluginStatus;
            _store$getState = store.getState(), status = _store$getState.status; // use a custom type prefix if specified

            typePrefix = configOptions.type_prefix || 'Contentstack';

            if (status && status.plugins && status.plugins['gatsby-source-contentstack']) {
              syncToken = status.plugins['gatsby-source-contentstack']["".concat(typePrefix.toLowerCase(), "-sync-token-").concat(configOptions.api_key)];
            }

            configOptions.syncToken = syncToken || null;
            _context2.next = 9;
            return fetchData(configOptions, reporter);

          case 9:
            _yield$fetchData = _context2.sent;
            contentstackData = _yield$fetchData.contentstackData;
            _context2.next = 13;
            return cache.get(typePrefix);

          case 13:
            contentstackData.contentTypes = _context2.sent;
            syncData = contentstackData.syncData.reduce(function (merged, item) {
              if (!merged[item.type]) {
                merged[item.type] = [];
              }

              merged[item.type].push(item);
              return merged;
            }, {}); // for checking if the reference node is present or not

            entriesNodeIds = new Set();
            assetsNodeIds = new Set();
            existingNodes = getNodes().filter(function (n) {
              return n.internal.owner === 'gatsby-source-contentstack';
            });
            existingNodes.forEach(function (n) {
              if (n.internal.type !== "".concat(typePrefix, "ContentTypes") && n.internal.type !== "".concat(typePrefix, "_assets")) {
                entriesNodeIds.add(n.id);
              }

              if (n.internal.type === "".concat(typePrefix, "_assets")) {
                assetsNodeIds.add(n.id);
              }

              touchNode(n);

              if (n.localAsset___NODE) {
                // Prevent GraphQL type inference from crashing on this property
                // touchNode({ nodeId: n.localAsset___NODE });
                touchNode(_objectSpread(_objectSpread({}, n), {}, {
                  nodeId: n.localAsset___NODE
                }));
              }
            });
            syncData.entry_published && syncData.entry_published.forEach(function (item) {
              var entryNodeId = makeEntryNodeUid(item.data, createNodeId, typePrefix);
              entriesNodeIds.add(entryNodeId);
            });
            countOfSupportedFormatFiles = 0;
            syncData.asset_published && syncData.asset_published.forEach(function (item) {
              /**
               * Get the count of assets (images), filtering out svg and gif format,
               * as these formats are not supported by gatsby-image.
               * We need the right count to render in progress bar,
               * which will show progress for downloading remote files.
               */
              if (configOptions.downloadImages) {
                // Filter the images from the assets
                var regexp = IMAGE_REGEXP;
                var matches;
                var isUnsupportedExt;

                try {
                  matches = regexp.exec(item.data.url);
                  isUnsupportedExt = checkIfUnsupportedFormat(item.data.url);
                  if (matches && !isUnsupportedExt) countOfSupportedFormatFiles++;
                } catch (error) {
                  reporter.panic('Something went wrong. Details: ', error);
                }
              }

              var entryNodeId = makeAssetNodeUid(item.data, createNodeId, typePrefix);
              assetsNodeIds.add(entryNodeId);
            }); // Cache the found count

            _context2.t0 = configOptions.downloadImages;

            if (!_context2.t0) {
              _context2.next = 26;
              break;
            }

            _context2.next = 26;
            return cache.set(SUPPORTED_FILES_COUNT, countOfSupportedFormatFiles);

          case 26:
            // syncData.asset_published && syncData.asset_published.forEach((item) => {
            //   const entryNodeId = makeAssetNodeUid(item.data, createNodeId, typePrefix);
            //   assetsNodeIds.add(entryNodeId);
            // });
            // adding nodes
            contentstackData.contentTypes.forEach(function (contentType) {
              contentType.uid = contentType.uid.replace(/-/g, '_');
              var contentTypeNode = processContentType(contentType, createNodeId, createContentDigest, typePrefix);
              createNode(contentTypeNode);
            });
            syncData.entry_published && syncData.entry_published.forEach(function (item) {
              item.content_type_uid = item.content_type_uid.replace(/-/g, '_');
              var contentType = contentstackData.contentTypes.find(function (contentType) {
                return item.content_type_uid === contentType.uid;
              });
              var normalizedEntry = normalizeEntry(contentType, item.data, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix);
              var sanitizedEntry = sanitizeEntry(contentType.schema, normalizedEntry);
              var entryNode = processEntry(contentType, sanitizedEntry, createNodeId, createContentDigest, typePrefix);
              createNode(entryNode);
            });
            syncData.asset_published && syncData.asset_published.forEach(function (item) {
              var assetNode = processAsset(item.data, createNodeId, createContentDigest, typePrefix);
              createNode(assetNode);
            });

            if (!configOptions.downloadImages) {
              _context2.next = 38;
              break;
            }

            _context2.prev = 30;
            _context2.next = 33;
            return downloadAssets({
              cache: cache,
              getCache: getCache,
              createNode: createNode,
              createNodeId: createNodeId,
              getNodesByType: getNodesByType,
              reporter: reporter
            }, typePrefix, configOptions);

          case 33:
            _context2.next = 38;
            break;

          case 35:
            _context2.prev = 35;
            _context2.t1 = _context2["catch"](30);
            reporter.info('Something went wrong while downloading assets. Details: ' + _context2.t1);

          case 38:
            // deleting nodes
            syncData.entry_unpublished && syncData.entry_unpublished.forEach(function (item) {
              deleteContentstackNodes(item.data, 'entry');
            });
            syncData.asset_unpublished && syncData.asset_unpublished.forEach(function (item) {
              deleteContentstackNodes(item.data, 'asset');
            });
            syncData.entry_deleted && syncData.entry_deleted.forEach(function (item) {
              deleteContentstackNodes(item.data, 'entry');
            });
            syncData.asset_deleted && syncData.asset_deleted.forEach(function (item) {
              deleteContentstackNodes(item.data, 'asset');
            });
            syncData.content_type_deleted && syncData.content_type_deleted.forEach(function (item) {
              item.content_type_uid = item.content_type_uid.replace(/-/g, '_');
              var sameContentTypeNodes = getNodes().filter(function (n) {
                return n.internal.type === "".concat(typePrefix, "_").concat(item.content_type_uid);
              });
              sameContentTypeNodes.forEach(function (node) {
                return deleteNode(node);
              });
            }); // Updating the syncToken

            nextSyncToken = contentstackData.sync_token; // Storing the sync state for the next sync

            newState = {};
            newState["".concat(typePrefix.toLowerCase(), "-sync-token-").concat(configOptions.api_key)] = nextSyncToken;
            setPluginStatus(newState);

          case 47:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[30, 35]]);
  }));

  return function (_x3, _x4) {
    return _ref4.apply(this, arguments);
  };
}();

exports.createResolvers = function (_ref6) {
  var createResolvers = _ref6.createResolvers;
  var resolvers = {};
  fileFields.forEach(function (fileField) {
    resolvers[fileField.parent] = _objectSpread(_objectSpread({}, resolvers[fileField.parent]), (0, _defineProperty2["default"])({}, fileField.field.uid, {
      resolve: function resolve(source, args, context, info) {
        if (fileField.field.multiple && source["".concat(fileField.field.uid, "___NODE")]) {
          var nodesData = [];
          source["".concat(fileField.field.uid, "___NODE")].forEach(function (id) {
            var existingNode = context.nodeModel.getNodeById({
              id: id
            });

            if (existingNode) {
              nodesData.push(existingNode);
            }
          });
          return nodesData;
        } else {
          var id = source["".concat(fileField.field.uid, "___NODE")];
          return context.nodeModel.getNodeById({
            id: id
          });
        }
      }
    }));
  });
  references.forEach(function (reference) {
    resolvers[reference.parent] = _objectSpread(_objectSpread({}, resolvers[reference.parent]), {}, (0, _defineProperty2["default"])({}, reference.uid, {
      resolve: function resolve(source, args, context, info) {
        if (source["".concat(reference.uid, "___NODE")]) {
          var nodesData = [];
          source["".concat(reference.uid, "___NODE")].forEach(function (id) {
            var existingNode = context.nodeModel.getNodeById({
              id: id
            });

            if (existingNode) {
              nodesData.push(existingNode);
            }
          });
          return nodesData;
        }

        return [];
      }
    }));
  });
  groups.forEach(function (group) {
    resolvers[group.parent] = _objectSpread(_objectSpread({}, resolvers[group.parent]), (0, _defineProperty2["default"])({}, group.field.uid, {
      resolve: function resolve(source) {
        if (group.field.multiple && !Array.isArray(source[group.field.uid])) {
          return [];
        }

        return source[group.field.uid] || null;
      }
    }));
  });
  createResolvers(resolvers);
};

exports.pluginOptionsSchema = function (_ref7) {
  var Joi = _ref7.Joi;
  return Joi.object({
    api_key: Joi.string().required().description("API Key is a unique key assigned to each stack."),
    delivery_token: Joi.string().required().description("Delivery Token is a read-only credential."),
    environment: Joi.string().required().description("Environment where you published your data."),
    cdn: Joi.string()["default"]("https://cdn.contentstack.io/v3").description("CDN set this to point to other cdn end point. For eg: https://eu-cdn.contentstack.com/v3 "),
    type_prefix: Joi.string()["default"]("Contentstack").description("Specify a different prefix for types. This is useful in cases where you have multiple instances of the plugin to be connected to different stacks."),
    expediteBuild: Joi["boolean"]()["default"](false).description("expediteBuild set this to either true or false."),
    enableSchemaGeneration: Joi["boolean"]()["default"](false).description("Specify true if you want to generate custom schema."),
    disableMandatoryFields: Joi["boolean"]()["default"](false).description("Specify true if you want to generate optional graphql fields for mandatory Contentstack fields"),
    downloadImages: Joi["boolean"]()["default"](false).description("Specify true if you want to download all your contentstack images locally")
  }).external(validateContentstackAccess);
};

var ERROR_MAP = (0, _defineProperty2["default"])({}, CODES.SyncError, {
  text: function text(context) {
    return context.sourceMessage;
  },
  level: "ERROR",
  type: "PLUGIN"
});

exports.onPreInit = function (_ref8) {
  var reporter = _ref8.reporter;

  if (reporter.setErrorMap) {
    reporter.setErrorMap(ERROR_MAP);
  }
};

var validateContentstackAccess = /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(pluginOptions) {
    var host;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            if (!(process.env.NODE_ENV === "test")) {
              _context3.next = 2;
              break;
            }

            return _context3.abrupt("return", undefined);

          case 2:
            host = pluginOptions.cdn ? pluginOptions.cdn : 'https://cdn.contentstack.io/v3';
            _context3.next = 5;
            return fetch("".concat(host, "/content_types?include_count=false"), {
              headers: {
                "api_key": "".concat(pluginOptions.api_key),
                "access_token": "".concat(pluginOptions.delivery_token)
              }
            }).then(function (res) {
              return res.ok;
            }).then(function (ok) {
              if (!ok) throw new Error("Cannot access Contentstack with api_key=".concat(pluginOptions.api_key, " & delivery_token=").concat(pluginOptions.delivery_token, "."));
            });

          case 5:
            return _context3.abrupt("return", undefined);

          case 6:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function validateContentstackAccess(_x5) {
    return _ref9.apply(this, arguments);
  };
}();