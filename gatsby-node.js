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

var _require = require('./normalize'),
    normalizeEntry = _require.normalizeEntry,
    processContentType = _require.processContentType,
    processEntry = _require.processEntry,
    processAsset = _require.processAsset,
    makeEntryNodeUid = _require.makeEntryNodeUid,
    makeAssetNodeUid = _require.makeAssetNodeUid,
    buildCustomSchema = _require.buildCustomSchema;

var _require2 = require('./fetch'),
    fetchData = _require2.fetchData,
    fetchContentTypes = _require2.fetchContentTypes;

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

exports.sourceNodes = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(_ref4, configOptions) {
    var actions = _ref4.actions,
        getNode = _ref4.getNode,
        getNodes = _ref4.getNodes,
        createNodeId = _ref4.createNodeId,
        store = _ref4.store,
        reporter = _ref4.reporter,
        createContentDigest = _ref4.createContentDigest;

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
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function (_x3, _x4) {
    return _ref3.apply(this, arguments);
  };
}();