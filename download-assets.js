'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var _require = require('gatsby-source-filesystem'),
  createRemoteFileNode = _require.createRemoteFileNode;
var _require2 = require('./normalize'),
  makeAssetNodeUid = _require2.makeAssetNodeUid;
var _require3 = require('./utils'),
  createProgress = _require3.createProgress,
  checkIfUnsupportedFormat = _require3.checkIfUnsupportedFormat,
  SUPPORTED_FILES_COUNT = _require3.SUPPORTED_FILES_COUNT,
  IMAGE_REGEXP = _require3.IMAGE_REGEXP,
  ASSET_NODE_UIDS = _require3.ASSET_NODE_UIDS;
var bar; // Keep track of the total number of jobs we push in the queue
var sizeBar;
var totalJobs = 0;
var totalSize = 0;
module.exports = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(function (_ref2, typePrefix, configOptions) {
    var cache = _ref2.cache,
      getCache = _ref2.getCache,
      createNode = _ref2.createNode,
      createNodeId = _ref2.createNodeId,
      getNodesByType = _ref2.getNodesByType,
      reporter = _ref2.reporter,
      createNodeField = _ref2.createNodeField,
      getNode = _ref2.getNode;
    return /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var assetUids, batches, i, batchPromises, skip, lastCount, shouldBreak, j, asset, regexp, matches, isUnsupportedExt, _t, _t2;
      return _regenerator["default"].wrap(function (_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 1;
            return cache.get(ASSET_NODE_UIDS);
          case 1:
            assetUids = _context.sent;
            configOptions.MAX_CONCURRENCY_LIMIT = process.env.GATSBY_CONCURRENT_DOWNLOAD || 20;
            batches = getBatches(assetUids.length, configOptions.MAX_CONCURRENCY_LIMIT); // Get total count of files that will be downloaded, excluding unsupported formats
            _context.next = 2;
            return cache.get(SUPPORTED_FILES_COUNT);
          case 2:
            totalJobs = _context.sent;
            // Create progress bar
            bar = createProgress("Downloading remote files", reporter);
            bar.start();
            bar.total = totalJobs;
            i = 0;
          case 3:
            if (!(i < batches.length)) {
              _context.next = 11;
              break;
            }
            batchPromises = [];
            skip = i * configOptions.MAX_CONCURRENCY_LIMIT;
            lastCount = (i + 1) * configOptions.MAX_CONCURRENCY_LIMIT;
            reporter.verbose("Skip: ".concat(skip, ", limit: ").concat(lastCount));
            shouldBreak = false;
            j = skip;
          case 4:
            if (!(j < lastCount)) {
              _context.next = 8;
              break;
            }
            asset = assetUids[j] ? getNode(assetUids[j]) : null; // Last batch will contain null references when accessed, can be handled in a better way
            if (!(!asset && i + 1 === batches.length)) {
              _context.next = 5;
              break;
            }
            shouldBreak = true;
            return _context.abrupt("continue", 8);
          case 5:
            // filter the images from all the assets
            regexp = IMAGE_REGEXP;
            matches = void 0; // SVG is not supported by gatsby-source-filesystem. Reference: https://github.com/gatsbyjs/gatsby/issues/10297
            isUnsupportedExt = false;
            try {
              matches = regexp.exec(asset.url);
              isUnsupportedExt = checkIfUnsupportedFormat(asset.url);
            } catch (error) {
              reporter.panic('Something went wrong. Details: ' + JSON.stringify(error));
            }
            if (!(matches && !isUnsupportedExt)) {
              _context.next = 7;
              break;
            }
            _t = batchPromises;
            _context.next = 6;
            return createRemoteFileNodePromise({
              cache: cache,
              getCache: getCache,
              createNode: createNode,
              createNodeId: createNodeId,
              createNodeField: createNodeField
            }, asset, typePrefix, reporter);
          case 6:
            _t.push.call(_t, _context.sent);
          case 7:
            j++;
            _context.next = 4;
            break;
          case 8:
            if (!shouldBreak) {
              _context.next = 9;
              break;
            }
            return _context.abrupt("continue", 11);
          case 9:
            _context.next = 10;
            return Promise.all(batchPromises);
          case 10:
            i++;
            _context.next = 3;
            break;
          case 11:
            bar && bar.done();
            sizeBar && sizeBar.done();
            reporter.verbose("Total size of downloaded files ".concat(totalSize));
            _context.next = 13;
            break;
          case 12:
            _context.prev = 12;
            _t2 = _context["catch"](0);
            reporter.info('Something went wrong while downloading assets. Details: ' + _t2);
          case 13:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[0, 12]]);
    })();
  });
  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();
var createRemoteFileNodePromise = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(params, node, typePrefix, reporter) {
    var fileNode, assetUid, fileSize, _t3;
    return _regenerator["default"].wrap(function (_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          if (!sizeBar) {
            sizeBar = createProgress("Total KBs downloaded", reporter);
            sizeBar.start();
          }
          assetUid = makeAssetNodeUid(node, params.createNodeId, typePrefix); // Get asset from cache
          _context2.next = 1;
          return params.cache.get(assetUid);
        case 1:
          fileNode = _context2.sent;
          // Handles condition if the asset has been updated, then it will be downloaded again
          if (fileNode && fileNode.updated_at !== node.updated_at) fileNode = null;
          if (fileNode) {
            _context2.next = 3;
            break;
          }
          _context2.next = 2;
          return createRemoteFileNode(_objectSpread(_objectSpread({}, params), {}, {
            url: encodeURI(node.url),
            parentNodeId: node.id
          }));
        case 2:
          fileNode = _context2.sent;
          if (!fileNode) {
            _context2.next = 3;
            break;
          }
          // Save updated_at value in the cached fileNode
          fileNode.updated_at = node.updated_at;
          fileSize = parseInt(fileNode.size / 1000); // Get size in megabytes
          totalSize = totalSize + fileSize;
          sizeBar.total = totalSize;
          sizeBar.tick(fileSize);
          // Cache fileNode to prevent re-downloading asset
          _context2.next = 3;
          return params.cache.set(assetUid, fileNode);
        case 3:
          bar.tick();
          if (fileNode) {
            params.createNodeField({
              node: node,
              name: 'localAsset',
              value: fileNode.id
            });
          }
          return _context2.abrupt("return", fileNode);
        case 4:
          _context2.prev = 4;
          _t3 = _context2["catch"](0);
          reporter.info('Something went wrong while creating file nodes. Details: ' + _t3);
        case 5:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 4]]);
  }));
  return function createRemoteFileNodePromise(_x4, _x5, _x6, _x7) {
    return _ref3.apply(this, arguments);
  };
}();
var getBatches = function getBatches(count, batchLimit) {
  var partitions = Math.ceil(count / batchLimit);
  // Returns array filled with indexes
  return Array(partitions).fill(null).map(function (_, i) {
    return i;
  });
};
//# sourceMappingURL=download-assets.js.map