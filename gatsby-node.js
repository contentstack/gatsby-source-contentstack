'use strict';

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends4 = require('babel-runtime/helpers/extends');

var _extends5 = _interopRequireDefault(_extends4);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('gatsby-source-filesystem'),
    createRemoteFileNode = _require.createRemoteFileNode;

var _require2 = require('./normalize'),
    normalizeEntry = _require2.normalizeEntry,
    processContentType = _require2.processContentType,
    processEntry = _require2.processEntry,
    processAsset = _require2.processAsset,
    makeEntryNodeUid = _require2.makeEntryNodeUid,
    makeAssetNodeUid = _require2.makeAssetNodeUid,
    buildCustomSchema = _require2.buildCustomSchema,
    extendSchemaWithDefaultEntryFields = _require2.extendSchemaWithDefaultEntryFields;

var _require3 = require('./fetch'),
    fetchData = _require3.fetchData,
    fetchContentTypes = _require3.fetchContentTypes;

var downloadAssets = require('./download-assets');

var references = [];
var groups = [];

exports.createSchemaCustomization = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref2, configOptions) {
    var cache = _ref2.cache,
        actions = _ref2.actions,
        schema = _ref2.schema;
    var contentTypes, typePrefix, createTypes;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            contentTypes = void 0;
            typePrefix = configOptions.type_prefix || 'Contentstack';
            _context.prev = 2;
            _context.next = 5;
            return fetchContentTypes(configOptions);

          case 5:
            contentTypes = _context.sent;
            _context.next = 8;
            return cache.set(typePrefix, contentTypes);

          case 8:
            _context.next = 13;
            break;

          case 10:
            _context.prev = 10;
            _context.t0 = _context['catch'](2);

            console.error('Contentstack fetch content type failed!');

          case 13:
            if (configOptions.enableSchemaGeneration) {
              createTypes = actions.createTypes;

              contentTypes.forEach(function (contentType) {
                var contentTypeUid = contentType.uid.replace(/-/g, '_');
                var name = typePrefix + '_' + contentTypeUid;
                var extendedSchema = extendSchemaWithDefaultEntryFields(contentType.schema);
                var result = buildCustomSchema(extendedSchema, [], [], [], name, typePrefix);
                references = references.concat(result.references);
                groups = groups.concat(result.groups);
                var typeDefs = ['type linktype{\n              title: String\n              href: String\n            }', schema.buildObjectType({
                  name: name,
                  fields: result.fields,
                  interfaces: ['Node']
                })];
                result.types = result.types.concat(typeDefs);
                createTypes(result.types);
              });
            }

          case 14:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[2, 10]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports.sourceNodes = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(_ref4, configOptions) {
    var cache = _ref4.cache,
        actions = _ref4.actions,
        getNode = _ref4.getNode,
        getNodes = _ref4.getNodes,
        createNodeId = _ref4.createNodeId,
        store = _ref4.store,
        reporter = _ref4.reporter,
        createContentDigest = _ref4.createContentDigest,
        getNodesByType = _ref4.getNodesByType,
        getCache = _ref4.getCache;

    var createNode, deleteNode, touchNode, setPluginStatus, syncToken, _store$getState, status, typePrefix, _ref5, contentstackData, syncData, entriesNodeIds, assetsNodeIds, existingNodes, deleteContentstackNodes, nextSyncToken, newState;

    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            deleteContentstackNodes = function deleteContentstackNodes(item, type) {
              var nodeId = '';
              var node = null;
              if (type === 'entry') {
                nodeId = createNodeId(typePrefix.toLowerCase() + '-entry-' + item.uid + '-' + item.locale);
              }
              if (type === 'asset') {
                nodeId = createNodeId(typePrefix.toLowerCase() + '-assets-' + item.uid + '-' + item.locale);
              }
              node = getNode(nodeId);
              if (node) {
                deleteNode({
                  node: node
                });
              }
            };

            createNode = actions.createNode, deleteNode = actions.deleteNode, touchNode = actions.touchNode, setPluginStatus = actions.setPluginStatus;
            syncToken = void 0;
            _store$getState = store.getState(), status = _store$getState.status;

            // use a custom type prefix if specified

            typePrefix = configOptions.type_prefix || 'Contentstack';


            if (status && status.plugins && status.plugins['gatsby-source-contentstack']) {
              syncToken = status.plugins['gatsby-source-contentstack'][typePrefix.toLowerCase() + '-sync-token-' + configOptions.api_key];
            }

            configOptions.syncToken = syncToken || null;

            _context2.next = 9;
            return fetchData(configOptions, reporter);

          case 9:
            _ref5 = _context2.sent;
            contentstackData = _ref5.contentstackData;
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
            }, {});

            // for checking if the reference node is present or not

            entriesNodeIds = new _set2.default();
            assetsNodeIds = new _set2.default();
            existingNodes = getNodes().filter(function (n) {
              return n.internal.owner === 'gatsby-source-contentstack';
            });


            existingNodes.forEach(function (n) {
              if (n.internal.type !== typePrefix + 'ContentTypes' && n.internal.type !== typePrefix + '_assets') {
                entriesNodeIds.add(n.id);
              }
              if (n.internal.type === typePrefix + '_assets') {
                assetsNodeIds.add(n.id);
              }
              touchNode({
                nodeId: n.id
              });
              if (n.localAsset___NODE) {
                // Prevent GraphQL type inference from crashing on this property
                touchNode({ nodeId: n.localAsset___NODE });
              }
            });

            syncData.entry_published && syncData.entry_published.forEach(function (item) {
              var entryNodeId = makeEntryNodeUid(item.data, createNodeId, typePrefix);
              entriesNodeIds.add(entryNodeId);
            });

            syncData.asset_published && syncData.asset_published.forEach(function (item) {
              var entryNodeId = makeAssetNodeUid(item.data, createNodeId, typePrefix);
              assetsNodeIds.add(entryNodeId);
            });

            if (configOptions.downloadAssets && node.internal.owner === 'gatsby-source-contentstack' && node.internal.type === typePrefix + '_assets') {
              downloadAssets({ getCache: getCache, createNode: createNode, createNodeId: createNodeId, getNodesByType: getNodesByType });
            }

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
              var entryNode = processEntry(contentType, normalizedEntry, createNodeId, createContentDigest, typePrefix);
              createNode(entryNode);
            });

            syncData.asset_published && syncData.asset_published.forEach(function (item) {
              var assetNode = processAsset(item.data, createNodeId, createContentDigest, typePrefix);
              createNode(assetNode);
            });

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
                return n.internal.type === typePrefix + '_' + item.content_type_uid;
              });
              sameContentTypeNodes.forEach(function (node) {
                return deleteNode({
                  node: node
                });
              });
            });

            // Updating the syncToken
            nextSyncToken = contentstackData.sync_token;

            // Storing the sync state for the next sync

            newState = {};

            newState[typePrefix.toLowerCase() + '-sync-token-' + configOptions.api_key] = nextSyncToken;
            setPluginStatus(newState);

          case 34:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function (_x3, _x4) {
    return _ref3.apply(this, arguments);
  };
}();

// exports.onCreateNode = async ({
//   cache,
//   actions: { createNode },
//   getCache,
//   createNodeId,
//   node,
// }, configOptions) => {
//   // use a custom type prefix if specified
//   const typePrefix = configOptions.type_prefix || 'Contentstack';

//   // filter the images from all the assets
//   // const regexp = new RegExp('https://(images).contentstack.io/v3/assets/')
//   // const matches = regexp.exec(node.url);

//   if (configOptions.downloadAssets && node.internal.owner === 'gatsby-source-contentstack' && node.internal.type === `${typePrefix}_assets`) {
//     const cachedNodeId = makeAssetNodeUid(node, createNodeId, typePrefix);

//     const cachedFileNode = await cache.get(cachedNodeId);

//     let fileNode;
//     // Checks for cached fileNode
//     if (cachedFileNode) {
//       fileNode = cachedFileNode;
//     } else {
//       // create a FileNode in Gatsby that gatsby-transformer-sharp will create optimized images for
//       fileNode = await createRemoteFileNode({
//         // the url of the remote image to generate a node for
//         url: encodeURI(node.url),
//         getCache,
//         createNode,
//         createNodeId,
//         parentNodeId: node.id,
//       });

//       if (fileNode)
//         // Cache the fileNode, so it does not have to downloaded again
//         await cache.set(cachedNodeId, fileNode);
//     }

//     if (fileNode)
//       node.localAsset___NODE = fileNode.id;
//   }
// };

exports.createResolvers = function (_ref6) {
  var createResolvers = _ref6.createResolvers;

  var resolvers = {};
  references.forEach(function (reference) {
    resolvers[reference.parent] = (0, _extends5.default)({}, resolvers[reference.parent], (0, _defineProperty3.default)({}, reference.uid, {
      resolve: function resolve(source, args, context, info) {
        if (source[reference.uid + '___NODE']) {
          var nodesData = [];
          source[reference.uid + '___NODE'].forEach(function (id) {
            context.nodeModel.getAllNodes().find(function (node) {
              if (node.id === id) {
                nodesData.push(node);
              }
            });
          });
          return nodesData;
        }
        return [];
      }
    }));
  });
  groups.forEach(function (group) {
    resolvers[group.parent] = (0, _extends5.default)({}, resolvers[group.parent], (0, _defineProperty3.default)({}, group.field.uid, {
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