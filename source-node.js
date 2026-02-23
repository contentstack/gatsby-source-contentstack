'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _require = require('./utils'),
  checkIfUnsupportedFormat = _require.checkIfUnsupportedFormat,
  SUPPORTED_FILES_COUNT = _require.SUPPORTED_FILES_COUNT,
  IMAGE_REGEXP = _require.IMAGE_REGEXP,
  CODES = _require.CODES,
  getContentTypeOption = _require.getContentTypeOption,
  ASSET_NODE_UIDS = _require.ASSET_NODE_UIDS;
var downloadAssets = require('./download-assets');
var _require2 = require('./node-helper'),
  deleteContentstackNodes = _require2.deleteContentstackNodes;
var _require3 = require('./fetch'),
  fetchData = _require3.fetchData;
var _require4 = require('./normalize'),
  normalizeEntry = _require4.normalizeEntry,
  processContentType = _require4.processContentType,
  processEntry = _require4.processEntry,
  processAsset = _require4.processAsset,
  makeEntryNodeUid = _require4.makeEntryNodeUid,
  makeAssetNodeUid = _require4.makeAssetNodeUid;
exports.sourceNodes = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(function (_ref2, configOptions) {
    var cache = _ref2.cache,
      actions = _ref2.actions,
      getNode = _ref2.getNode,
      getNodes = _ref2.getNodes,
      createNodeId = _ref2.createNodeId,
      reporter = _ref2.reporter,
      createContentDigest = _ref2.createContentDigest,
      getNodesByType = _ref2.getNodesByType,
      getCache = _ref2.getCache;
    return /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var createNode, deleteNode, touchNode, createNodeField, typePrefix, contentstackData, contentTypeOption, _yield$fetchData, _contentstackData, syncData, entriesNodeIds, assetsNodeIds, existingNodes, countOfSupportedFormatFiles, assetUids, contentTypesMap, _t, _t2;
      return _regenerator["default"].wrap(function (_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            createNode = actions.createNode, deleteNode = actions.deleteNode, touchNode = actions.touchNode, createNodeField = actions.createNodeField; // use a custom type prefix if specified
            typePrefix = configOptions.type_prefix || 'Contentstack';
            _context.prev = 1;
            contentTypeOption = getContentTypeOption(configOptions);
            _context.next = 2;
            return fetchData(configOptions, reporter, cache, contentTypeOption);
          case 2:
            _yield$fetchData = _context.sent;
            _contentstackData = _yield$fetchData.contentstackData;
            contentstackData = _contentstackData;
            _context.next = 3;
            return cache.get(typePrefix);
          case 3:
            contentstackData.contentTypes = _context.sent;
            _context.next = 5;
            break;
          case 4:
            _context.prev = 4;
            _t = _context["catch"](1);
            reporter.panic({
              id: CODES.SyncError,
              context: {
                sourceMessage: "Error occurred while fetching contentstack in [sourceNodes]. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help."
              },
              error: _t
            });
            throw _t;
          case 5:
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
            });
            syncData.entry_published && syncData.entry_published.forEach(function (item) {
              var entryNodeId = makeEntryNodeUid(item.data, createNodeId, typePrefix);
              entriesNodeIds.add(entryNodeId);
            });
            countOfSupportedFormatFiles = 0, assetUids = [];
            syncData.asset_published && syncData.asset_published.forEach(function (item) {
              /**
               * Get the count of assets (images), filtering out svg and gif format, as these formats are not supported by gatsby-image.
               * We need the right count to render in progress bar, which will show progress for downloading remote files.
               */
              if (configOptions.downloadImages) {
                var matches, isUnsupportedExt;
                try {
                  matches = IMAGE_REGEXP.exec(item.data.url);
                  isUnsupportedExt = checkIfUnsupportedFormat(item.data.url);
                  if (matches && !isUnsupportedExt) countOfSupportedFormatFiles++;
                } catch (error) {
                  reporter.panic('Something went wrong. Details: ', error);
                }
              }
              var assetNodeId = makeAssetNodeUid(item.data, createNodeId, typePrefix);
              assetsNodeIds.add(assetNodeId);
              assetUids.push(assetNodeId);
            });
            _context.next = 6;
            return cache.set(ASSET_NODE_UIDS, assetUids);
          case 6:
            _t2 = configOptions.downloadImages;
            if (!_t2) {
              _context.next = 7;
              break;
            }
            _context.next = 7;
            return cache.set(SUPPORTED_FILES_COUNT, countOfSupportedFormatFiles);
          case 7:
            contentTypesMap = {};
            contentstackData.contentTypes.forEach(function (contentType) {
              contentType.uid = contentType.uid.replace(/-/g, '_');
              var contentTypeNode = processContentType(contentType, createNodeId, createContentDigest, typePrefix);
              contentTypesMap[contentType.uid] = contentType;
              createNode(contentTypeNode);
            });
            syncData.entry_published && syncData.entry_published.forEach(function (item) {
              item.content_type_uid = item.content_type_uid.replace(/-/g, '_');
              var contentType = contentTypesMap[item.content_type_uid];
              var normalizedEntry = normalizeEntry(contentType, item.data, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix, configOptions);
              var entryNode = processEntry(contentType, normalizedEntry, createNodeId, createContentDigest, typePrefix);
              createNode(entryNode);
            });
            syncData.asset_published && syncData.asset_published.forEach(function (item) {
              var assetNode = processAsset(item.data, createNodeId, createContentDigest, typePrefix);
              createNode(assetNode);
            });
            if (!configOptions.downloadImages) {
              _context.next = 8;
              break;
            }
            _context.next = 8;
            return downloadAssets({
              cache: cache,
              getCache: getCache,
              createNode: createNode,
              createNodeId: createNodeId,
              getNodesByType: getNodesByType,
              reporter: reporter,
              createNodeField: createNodeField,
              getNode: getNode
            }, typePrefix, configOptions);
          case 8:
            // deleting nodes
            syncData.entry_unpublished && syncData.entry_unpublished.forEach(function (item) {
              return deleteContentstackNodes(item.data, 'entry', createNodeId, getNode, deleteNode, typePrefix);
            });
            syncData.asset_unpublished && syncData.asset_unpublished.forEach(function (item) {
              return deleteContentstackNodes(item.data, 'asset', createNodeId, getNode, deleteNode, typePrefix);
            });
            syncData.entry_deleted && syncData.entry_deleted.forEach(function (item) {
              return deleteContentstackNodes(item.data, 'entry', createNodeId, getNode, deleteNode, typePrefix);
            });
            syncData.asset_deleted && syncData.asset_deleted.forEach(function (item) {
              return deleteContentstackNodes(item.data, 'asset', createNodeId, getNode, deleteNode, typePrefix);
            });
            syncData.content_type_deleted && syncData.content_type_deleted.forEach(function (item) {
              item.content_type_uid = item.content_type_uid.replace(/-/g, '_');
              var sameContentTypeNodes = getNodes().filter(function (n) {
                return n.internal.type === "".concat(typePrefix, "_").concat(item.content_type_uid);
              });
              sameContentTypeNodes.forEach(function (node) {
                return deleteNode(node);
              });
            });
          case 9:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[1, 4]]);
    })();
  });
  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=source-node.js.map