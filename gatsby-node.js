"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _set = require("babel-runtime/core-js/set");

var _set2 = _interopRequireDefault(_set);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require("./normalize"),
    normalizeEntry = _require.normalizeEntry,
    processContentType = _require.processContentType,
    processEntry = _require.processEntry,
    processAsset = _require.processAsset,
    makeEntryNodeUid = _require.makeEntryNodeUid,
    makeAssetNodeUid = _require.makeAssetNodeUid;

var fetchData = require("./fetch");

exports.sourceNodes = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref2, configOptions) {
        var actions = _ref2.actions,
            getNode = _ref2.getNode,
            getNodes = _ref2.getNodes,
            createNodeId = _ref2.createNodeId,
            store = _ref2.store,
            reporter = _ref2.reporter;

        var createNode, deleteNode, touchNode, setPluginStatus, syncToken, _ref3, contentstackData, publishedEntriesType, publishedAssetsType, unPublishedEntriesType, unPublishedAssetsType, entriesDeleteType, assetsDeleteType, contentTypeDeleteType, entriesNodeIds, assetsNodeIds, existingNodes, deleteContentstackNodes, nextSyncToken, newState;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        deleteContentstackNodes = function deleteContentstackNodes(item, type) {
                            var nodeId = '';
                            var node = null;
                            if (type === 'entry') {
                                nodeId = createNodeId("contentstack-entry-" + item.uid + "-" + item.locale);
                            }
                            if (type === 'asset') {
                                nodeId = createNodeId("contentstack-assets-" + item.uid + "-" + item.locale);
                            }
                            node = getNode(nodeId);
                            if (node) {
                                deleteNode({ node: node });
                            }
                        };

                        createNode = actions.createNode, deleteNode = actions.deleteNode, touchNode = actions.touchNode, setPluginStatus = actions.setPluginStatus;
                        syncToken = void 0;


                        if (store.getState().status.plugins && store.getState().status.plugins["gatsby-source-contentstack"] && store.getState().status.plugins["gatsby-source-contentstack"]["contentstack-sync-token-" + configOptions.api_key]) {
                            syncToken = store.getState().status.plugins["gatsby-source-contentstack"]["contentstack-sync-token-" + configOptions.api_key];
                        }

                        configOptions.syncToken = syncToken || null;

                        _context.next = 7;
                        return fetchData(configOptions);

                    case 7:
                        _ref3 = _context.sent;
                        contentstackData = _ref3.contentstackData;
                        publishedEntriesType = contentstackData.syncData.filter(function (item) {
                            return item.type === 'entry_published';
                        }) || [];
                        publishedAssetsType = contentstackData.syncData.filter(function (item) {
                            return item.type === 'asset_published';
                        }) || [];

                        // for removing nodes from cache if present

                        unPublishedEntriesType = contentstackData.syncData.filter(function (item) {
                            return item.type === 'entry_unpublished';
                        }) || [];
                        unPublishedAssetsType = contentstackData.syncData.filter(function (item) {
                            return item.type === 'asset_unpublished';
                        }) || [];
                        entriesDeleteType = contentstackData.syncData.filter(function (item) {
                            return item.type === 'entry_deleted';
                        }) || [];
                        assetsDeleteType = contentstackData.syncData.filter(function (item) {
                            return item.type === 'asset_deleted';
                        }) || [];
                        contentTypeDeleteType = contentstackData.syncData.filter(function (item) {
                            return item.type === 'content_type_deleted';
                        }) || [];

                        // for checking if the reference node is present or not

                        entriesNodeIds = new _set2.default();
                        assetsNodeIds = new _set2.default();


                        publishedEntriesType.forEach(function (item) {
                            var entryNodeId = makeEntryNodeUid(item.data, createNodeId);
                            entriesNodeIds.add(entryNodeId);
                        });

                        publishedAssetsType.forEach(function (item) {
                            var entryNodeId = makeAssetNodeUid(item.data, createNodeId);
                            assetsNodeIds.add(entryNodeId);
                        });

                        publishedEntriesType.forEach(function (item) {
                            var contentType = contentstackData.contentTypes.find(function (contentType) {
                                return item.content_type_uid === contentType.uid;
                            });
                            var normalizedEntry = normalizeEntry(contentType, item.data, entriesNodeIds, assetsNodeIds, createNodeId);
                            var entryNode = processEntry(contentType, normalizedEntry, createNodeId);
                            createNode(entryNode);
                        });

                        publishedAssetsType.forEach(function (item) {
                            var assetNode = processAsset(item.data, createNodeId);
                            createNode(assetNode);
                        });

                        contentstackData.contentTypes.forEach(function (contentType) {
                            var contentTypeNode = processContentType(contentType, createNodeId);
                            createNode(contentTypeNode);
                        });

                        existingNodes = getNodes().filter(function (n) {
                            return n.internal.owner === "gatsby-source-contentstack";
                        });


                        existingNodes.forEach(function (n) {
                            return touchNode({ nodeId: n.id });
                        });

                        unPublishedEntriesType.forEach(function (item) {
                            deleteContentstackNodes(item.data, 'entry');
                        });

                        unPublishedAssetsType.forEach(function (item) {
                            deleteContentstackNodes(item.data, 'asset');
                        });

                        entriesDeleteType.forEach(function (item) {
                            deleteContentstackNodes(item.data, 'entry');
                        });

                        assetsDeleteType.forEach(function (item) {
                            deleteContentstackNodes(item.data, 'asset');
                        });

                        contentTypeDeleteType.forEach(function (item) {
                            var sameContentTypeNodes = getNodes().filter(function (n) {
                                return n.internal.type === "Contentstack_" + item.content_type_uid;
                            });
                            sameContentTypeNodes.forEach(function (node) {
                                return deleteNode({ node: node });
                            });
                        });

                        // Updating the syncToken
                        nextSyncToken = contentstackData.sync_token;

                        // Storing the sync state for the next sync

                        newState = {};

                        newState["contentstack-sync-token-" + configOptions.api_key] = nextSyncToken;
                        setPluginStatus(newState);

                        return _context.abrupt("return");

                    case 35:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }));

    return function (_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();