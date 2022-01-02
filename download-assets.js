'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(_ref2, typePrefix, configOptions) {
    var cache, getCache, createNode, createNodeId, getNodesByType, reporter, createNodeField, getNode, assetUids, batches, i, batchPromises, skip, lastCount, shouldBreak, j, asset, regexp, matches, isUnsupportedExt;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            cache = _ref2.cache, getCache = _ref2.getCache, createNode = _ref2.createNode, createNodeId = _ref2.createNodeId, getNodesByType = _ref2.getNodesByType, reporter = _ref2.reporter, createNodeField = _ref2.createNodeField, getNode = _ref2.getNode;
            _context.prev = 1;
            _context.next = 4;
            return cache.get(ASSET_NODE_UIDS);

          case 4:
            assetUids = _context.sent;
            // const assets = getNodesByType(`${typePrefix}_assets`);
            configOptions.MAX_CONCURRENCY_LIMIT = process.env.GATSBY_CONCURRENT_DOWNLOAD || 20; // const batches = getBatches(assets.length, configOptions.MAX_CONCURRENCY_LIMIT);

            batches = getBatches(assetUids.length, configOptions.MAX_CONCURRENCY_LIMIT); // Get total count of files that will be downloaded, excluding unsupported formats

            _context.next = 9;
            return cache.get(SUPPORTED_FILES_COUNT);

          case 9:
            totalJobs = _context.sent;
            // Create progress bar
            bar = createProgress("Downloading remote files", reporter);
            bar.start();
            bar.total = totalJobs;
            i = 0;

          case 14:
            if (!(i < batches.length)) {
              _context.next = 46;
              break;
            }

            batchPromises = [];
            skip = i * configOptions.MAX_CONCURRENCY_LIMIT;
            lastCount = (i + 1) * configOptions.MAX_CONCURRENCY_LIMIT;
            reporter.verbose("Skip: ".concat(skip, ", limit: ").concat(lastCount));
            shouldBreak = false;
            j = skip;

          case 21:
            if (!(j < lastCount)) {
              _context.next = 39;
              break;
            }

            // const asset = assets[j];
            asset = assetUids[j] ? getNode(assetUids[j]) : null; // Last batch will contain null references when accessed, can be handled in a better way

            if (!(!asset && i + 1 === batches.length)) {
              _context.next = 26;
              break;
            }

            shouldBreak = true;
            return _context.abrupt("break", 39);

          case 26:
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
              _context.next = 36;
              break;
            }

            _context.t0 = batchPromises;
            _context.next = 34;
            return createRemoteFileNodePromise({
              cache: cache,
              getCache: getCache,
              createNode: createNode,
              createNodeId: createNodeId,
              createNodeField: createNodeField
            }, asset, typePrefix, reporter);

          case 34:
            _context.t1 = _context.sent;

            _context.t0.push.call(_context.t0, _context.t1);

          case 36:
            j++;
            _context.next = 21;
            break;

          case 39:
            if (!shouldBreak) {
              _context.next = 41;
              break;
            }

            return _context.abrupt("break", 46);

          case 41:
            _context.next = 43;
            return Promise.all(batchPromises);

          case 43:
            i++;
            _context.next = 14;
            break;

          case 46:
            bar && bar.done();
            sizeBar && sizeBar.done();
            reporter.verbose("Total size of downloaded files ".concat(totalSize));
            _context.next = 54;
            break;

          case 51:
            _context.prev = 51;
            _context.t2 = _context["catch"](1);
            reporter.info('Something went wrong while downloading assets. Details: ' + _context.t2); // throw error;

          case 54:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 51]]);
  }));

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var createRemoteFileNodePromise = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(params, node, typePrefix, reporter) {
    var fileNode, assetUid, fileSize;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;

            if (!sizeBar) {
              sizeBar = createProgress("Total KBs downloaded", reporter);
              sizeBar.start();
            }

            assetUid = makeAssetNodeUid(node, params.createNodeId, typePrefix); // Get asset from cache

            _context2.next = 5;
            return params.cache.get(assetUid);

          case 5:
            fileNode = _context2.sent;
            // Handles condition if the asset has been updated, then it will be downloaded again
            if (fileNode && fileNode.updated_at !== node.updated_at) fileNode = null;

            if (fileNode) {
              _context2.next = 19;
              break;
            }

            _context2.next = 10;
            return createRemoteFileNode(_objectSpread(_objectSpread({}, params), {}, {
              url: encodeURI(node.url),
              parentNodeId: node.id
            }));

          case 10:
            fileNode = _context2.sent;

            if (!fileNode) {
              _context2.next = 19;
              break;
            }

            // Save updated_at value in the cached fileNode
            fileNode.updated_at = node.updated_at;
            fileSize = parseInt(fileNode.size / 1000); // Get size in megabytes

            totalSize = totalSize + fileSize;
            sizeBar.total = totalSize;
            sizeBar.tick(fileSize); // Cache fileNode to prevent re-downloading asset

            _context2.next = 19;
            return params.cache.set(assetUid, fileNode);

          case 19:
            bar.tick();

            if (fileNode) {
              // node.localAsset___NODE = fileNode.id;
              params.createNodeField({
                node: node,
                name: 'localAsset',
                value: fileNode.id
              });
            }

            return _context2.abrupt("return", fileNode);

          case 24:
            _context2.prev = 24;
            _context2.t0 = _context2["catch"](0);
            reporter.info('Something went wrong while creating file nodes, Details: ' + _context2.t0); // throw error;

          case 27:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 24]]);
  }));

  return function createRemoteFileNodePromise(_x4, _x5, _x6, _x7) {
    return _ref3.apply(this, arguments);
  };
}();

var getBatches = function getBatches(count, batchLimit) {
  var partitions = Math.ceil(count / batchLimit); // Returns array filled with indexes

  return Array(partitions).fill(null).map(function (_, i) {
    return i;
  });
};