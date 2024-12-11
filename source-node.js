'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
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
  fetchData = _require3.fetchData,
  fetchTaxonomies = _require3.fetchTaxonomies; // Kept this import for taxonomy fetching
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
    return /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var createNode, deleteNode, touchNode, createNodeField, typePrefix, contentstackData, contentTypeOption, _yield$fetchData, _contentstackData, syncData, hasTaxonomies, taxonomies, entriesNodeIds, assetsNodeIds, existingNodes, countOfSupportedFormatFiles, assetUids, contentTypesMap;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            createNode = actions.createNode, deleteNode = actions.deleteNode, touchNode = actions.touchNode, createNodeField = actions.createNodeField; // use a custom type prefix if specified
            typePrefix = configOptions.type_prefix || 'Contentstack';
            _context2.prev = 2;
            contentTypeOption = getContentTypeOption(configOptions);
            _context2.next = 6;
            return fetchData(configOptions, reporter, cache, contentTypeOption);
          case 6:
            _yield$fetchData = _context2.sent;
            _contentstackData = _yield$fetchData.contentstackData;
            contentstackData = _contentstackData;
            _context2.next = 11;
            return cache.get(typePrefix);
          case 11:
            contentstackData.contentTypes = _context2.sent;
            _context2.next = 18;
            break;
          case 14:
            _context2.prev = 14;
            _context2.t0 = _context2["catch"](2);
            reporter.panic({
              id: CODES.SyncError,
              context: {
                sourceMessage: "Error occurred while fetching contentstack in [sourceNodes]. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help."
              },
              error: _context2.t0
            });
            throw _context2.t0;
          case 18:
            syncData = contentstackData.syncData.reduce(function (merged, item) {
              if (!merged[item.type]) {
                merged[item.type] = [];
              }
              merged[item.type].push(item);
              return merged;
            }, {}); // Check for taxonomy presence dynamically in content types
            hasTaxonomies = contentstackData.contentTypes.some(function (contentType) {
              return contentType.schema.some(function (field) {
                return field.data_type === 'taxonomy';
              });
            });
            if (!hasTaxonomies) {
              _context2.next = 39;
              break;
            }
            _context2.prev = 21;
            reporter.info('Fetching taxonomies...');
            console.log('Fetching taxonomies with configOptions:', configOptions);
            _context2.next = 26;
            return fetchTaxonomies(configOptions);
          case 26:
            taxonomies = _context2.sent;
            console.log('Fetched taxonomies:', taxonomies);
            _context2.next = 30;
            return Promise.all(taxonomies.map(/*#__PURE__*/function () {
              var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(taxonomy) {
                var taxonomyNode;
                return _regenerator["default"].wrap(function _callee$(_context) {
                  while (1) switch (_context.prev = _context.next) {
                    case 0:
                      taxonomyNode = _objectSpread(_objectSpread({}, taxonomy), {}, {
                        id: createNodeId("".concat(taxonomy.uid)),
                        parent: null,
                        children: [],
                        internal: {
                          type: "".concat(typePrefix, "Taxonomy"),
                          contentDigest: createContentDigest(taxonomy)
                        }
                      });
                      _context.next = 3;
                      return createNode(taxonomyNode);
                    case 3:
                      reporter.info("Created taxonomy node: ".concat(taxonomy.uid));
                    case 4:
                    case "end":
                      return _context.stop();
                  }
                }, _callee);
              }));
              return function (_x3) {
                return _ref3.apply(this, arguments);
              };
            }()));
          case 30:
            reporter.info('Taxonomy nodes created.');
            _context2.next = 37;
            break;
          case 33:
            _context2.prev = 33;
            _context2.t1 = _context2["catch"](21);
            console.log('Error fetching taxonomies:', _context2.t1);
            reporter.warn("Failed to fetch or create taxonomies. Error: ".concat(_context2.t1.message));
          case 37:
            _context2.next = 40;
            break;
          case 39:
            reporter.info('No taxonomies found in content types. Skipping taxonomy processing.');
          case 40:
            console.log('Starting to process existing nodes...');

            // For checking if the reference node is present or not
            entriesNodeIds = new Set();
            assetsNodeIds = new Set();
            existingNodes = getNodes().filter(function (n) {
              return n.internal.owner === 'gatsby-source-contentstack';
            });
            console.log('Existing nodes:', existingNodes.length);
            existingNodes.forEach(function (n) {
              if (n.internal.type !== "".concat(typePrefix, "ContentTypes") && n.internal.type !== "".concat(typePrefix, "_assets")) {
                entriesNodeIds.add(n.id);
              }
              if (n.internal.type === "".concat(typePrefix, "_assets")) {
                assetsNodeIds.add(n.id);
              }
              touchNode(n);
            });
            console.log('Existing nodes processed.');
            syncData.entry_published && syncData.entry_published.forEach(function (item) {
              var entryNodeId = makeEntryNodeUid(item.data, createNodeId, typePrefix);
              entriesNodeIds.add(entryNodeId);
            });
            console.log('Entry published nodes processed.');
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
            console.log('Asset published nodes processed.');
            _context2.next = 54;
            return cache.set(ASSET_NODE_UIDS, assetUids);
          case 54:
            console.log('Asset UIDs cached.');

            // Cache the found count
            _context2.t2 = configOptions.downloadImages;
            if (!_context2.t2) {
              _context2.next = 59;
              break;
            }
            _context2.next = 59;
            return cache.set(SUPPORTED_FILES_COUNT, countOfSupportedFormatFiles);
          case 59:
            console.log('Supported files count cached.');
            contentTypesMap = {};
            contentstackData.contentTypes.forEach(function (contentType) {
              contentType.uid = contentType.uid.replace(/-/g, '_');
              var contentTypeNode = processContentType(contentType, createNodeId, createContentDigest, typePrefix);
              contentTypesMap[contentType.uid] = contentType;
              createNode(contentTypeNode);
            });
            console.log('Content types processed.');
            syncData.entry_published && syncData.entry_published.forEach(function (item) {
              item.content_type_uid = item.content_type_uid.replace(/-/g, '_');
              var contentType = contentTypesMap[item.content_type_uid];
              var normalizedEntry = normalizeEntry(contentType, item.data, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix, configOptions);
              var entryNode = processEntry(contentType, normalizedEntry, createNodeId, createContentDigest, typePrefix);
              createNode(entryNode);
            });
            console.log('Entry nodes created.');
            syncData.asset_published && syncData.asset_published.forEach(function (item) {
              var assetNode = processAsset(item.data, createNodeId, createContentDigest, typePrefix);
              createNode(assetNode);
            });
            console.log('Asset nodes created.');
            if (!configOptions.downloadImages) {
              _context2.next = 71;
              break;
            }
            console.log('Starting to download assets...');
            _context2.next = 71;
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
          case 71:
            // deleting nodes
            console.log('Deleting unpublished entry nodes...');
            syncData.entry_unpublished && syncData.entry_unpublished.forEach(function (item) {
              return deleteContentstackNodes(item.data, 'entry', createNodeId, getNode, deleteNode, typePrefix);
            });
            console.log('Entry unpublished nodes deleted.');
            console.log('Deleting unpublished asset nodes...');
            syncData.asset_unpublished && syncData.asset_unpublished.forEach(function (item) {
              return deleteContentstackNodes(item.data, 'asset', createNodeId, getNode, deleteNode, typePrefix);
            });
            console.log('Asset unpublished nodes deleted.');
            console.log('Deleting deleted entry nodes...');
            syncData.entry_deleted && syncData.entry_deleted.forEach(function (item) {
              return deleteContentstackNodes(item.data, 'entry', createNodeId, getNode, deleteNode, typePrefix);
            });
            console.log('Entry deleted nodes deleted.');
            console.log('Deleting deleted asset nodes...');
            syncData.asset_deleted && syncData.asset_deleted.forEach(function (item) {
              return deleteContentstackNodes(item.data, 'asset', createNodeId, getNode, deleteNode, typePrefix);
            });
            console.log('Asset deleted nodes deleted.');
            console.log('Deleting deleted content type nodes...');
            syncData.content_type_deleted && syncData.content_type_deleted.forEach(function (item) {
              item.content_type_uid = item.content_type_uid.replace(/-/g, '_');
              var sameContentTypeNodes = getNodes().filter(function (n) {
                return n.internal.type === "".concat(typePrefix, "_").concat(item.content_type_uid);
              });
              sameContentTypeNodes.forEach(function (node) {
                return deleteNode(node);
              });
            });
            console.log('Content type deleted nodes deleted.');
            console.log('Source nodes process completed.');
          case 87:
          case "end":
            return _context2.stop();
        }
      }, _callee2, null, [[2, 14], [21, 33]]);
    })();
  });
  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=source-node.js.map