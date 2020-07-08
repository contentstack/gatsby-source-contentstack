'use strict';

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

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
    buildCustomSchema = _require2.buildCustomSchema;

var _require3 = require('./fetch'),
    fetchData = _require3.fetchData,
    fetchContentTypes = _require3.fetchContentTypes;

var contentTypes = [];

exports.createSchemaCustomization = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref2, configOptions) {
    var actions = _ref2.actions,
        schema = _ref2.schema;
    var typePrefix, createTypes;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return fetchContentTypes(configOptions);

          case 3:
            contentTypes = _context.sent;
            _context.next = 9;
            break;

          case 6:
            _context.prev = 6;
            _context.t0 = _context['catch'](0);

            console.error('Contentsatck fetch content type failed!');

          case 9:
            if (configOptions.enableSchemaGeneration) {
              typePrefix = configOptions.type_prefix || 'Contentstack';
              createTypes = actions.createTypes;

              contentTypes.forEach(function (contentType) {
                var contentTypeUid = contentType.uid.replace(/-/g, '_');
                var name = typePrefix + '_' + contentTypeUid;
                var result = buildCustomSchema(contentType.schema, [], name, typePrefix);
                if ((0, _keys2.default)(result.references).length === 0) {
                  var typeDefs = ['type linktype{\n              title: String\n              href: String\n            }', schema.buildObjectType({
                    name: name,
                    fields: result.fields,
                    interfaces: ['Node']
                  })];
                  result.types = result.types.concat(typeDefs);
                  createTypes(result.types);
                } else {
                  var _typeDefs = ['type linktype{\n              title: String\n              href: String\n            }', schema.buildUnionType({
                    name: result.references.name,
                    types: result.references.unions
                  }), schema.buildObjectType({
                    name: name,
                    fields: result.fields,
                    interfaces: ['Node']
                  })];
                  result.types = result.types.concat(_typeDefs);
                  createTypes(result.types);
                }
              });
            }

          case 10:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[0, 6]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports.onCreateNode = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(_ref4, configOptions) {
    var createNode = _ref4.actions.createNode,
        getCache = _ref4.getCache,
        createNodeId = _ref4.createNodeId,
        node = _ref4.node;
    var typePrefix, fileNode;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            // use a custom type prefix if specified
            typePrefix = configOptions.type_prefix || 'Contentstack';
            // because onCreateNode is called for all nodes, verify that you are only running this code on nodes created by your plugin

            if (!(node.internal.owner === 'gatsby-source-contentstack' && node.internal.type === typePrefix + '_assets')) {
              _context2.next = 7;
              break;
            }

            // create a FileNode in Gatsby that gatsby-transformer-sharp will create optimized images for
            console.log(encodeURI(node.url), 'url>>>>>>>>>>>>>>>');
            _context2.next = 5;
            return createRemoteFileNode({
              // the url of the remote image to generate a node for
              url: encodeURI(node.url),
              getCache: getCache,
              createNode: createNode,
              createNodeId: createNodeId,
              parentNodeId: node.id
            });

          case 5:
            fileNode = _context2.sent;


            if (fileNode) {
              node.localAsset___NODE = fileNode.id;
            }

          case 7:
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

exports.sourceNodes = function () {
  var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(_ref6, configOptions) {
    var actions = _ref6.actions,
        getNode = _ref6.getNode,
        getNodes = _ref6.getNodes,
        createNodeId = _ref6.createNodeId,
        store = _ref6.store,
        reporter = _ref6.reporter,
        createContentDigest = _ref6.createContentDigest;

    var createNode, deleteNode, touchNode, setPluginStatus, syncToken, _store$getState, status, typePrefix, _ref7, contentstackData, syncData, entriesNodeIds, assetsNodeIds, existingNodes, deleteContentstackNodes, nextSyncToken, newState;

    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
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

            _context3.next = 9;
            return fetchData(configOptions, reporter);

          case 9:
            _ref7 = _context3.sent;
            contentstackData = _ref7.contentstackData;

            contentstackData.contentTypes = contentTypes;
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

            // adding nodes

            syncData.entry_published && syncData.entry_published.forEach(function (item) {
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

            // if (configOptions.downloadAssets) {
            //   downloadAssets({
            //     actions,
            //     createNodeId,
            //     store,
            //     cache,
            //     getCache,
            //     getNodes,
            //     reporter,
            //   }, typePrefix);
            // }

            contentstackData.contentTypes.forEach(function (contentType) {
              var contentTypeNode = processContentType(contentType, createNodeId, createContentDigest, typePrefix);
              createNode(contentTypeNode);
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

          case 31:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function (_x5, _x6) {
    return _ref5.apply(this, arguments);
  };
}();