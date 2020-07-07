'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ProgressBar = require('progress');

var _require = require('gatsby-source-filesystem'),
    createRemoteFileNode = _require.createRemoteFileNode;

var bar = new ProgressBar('Downloading Contentstack Assets [:bar] :current/:total :elapsed secs :percent', {
  total: 0,
  width: 30
});

var totalJobs = 0;

/**
 * @name downloadAssets
 * @description Downloads assets to the local filesystem.
 * The asset files will be downloaded and cached. Use `localAsset` to link to them
 * @param gatsbyFunctions - Gatsby's internal helper functions
 */

var downloadAssets = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(gatsbyFunctions, typePrefix) {
    var _gatsbyFunctions$acti, createNode, touchNode, createNodeId, store, cache, getCache, getNodes, reporter, assetsNodes;

    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _gatsbyFunctions$acti = gatsbyFunctions.actions, createNode = _gatsbyFunctions$acti.createNode, touchNode = _gatsbyFunctions$acti.touchNode, createNodeId = gatsbyFunctions.createNodeId, store = gatsbyFunctions.store, cache = gatsbyFunctions.cache, getCache = gatsbyFunctions.getCache, getNodes = gatsbyFunctions.getNodes, reporter = gatsbyFunctions.reporter;

            // Any Contentstack_asset nodes will be downloaded, cached and copied to public/static
            // regardless of if you use `localAsset` to link an asset or not.

            assetsNodes = getNodes().filter(function (n) {
              return n.internal.owner === 'gatsby-source-contentstack' && n.internal.type === typePrefix + '_assets';
            });
            _context2.next = 4;
            return _promise2.default.all(assetsNodes.map(function () {
              var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(node) {
                var fileNodeID, publishedLocale, remoteDataCacheKey, cacheRemoteData, url, fileNode;
                return _regenerator2.default.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        totalJobs += 1;
                        bar.total = totalJobs;

                        fileNodeID = void 0;
                        publishedLocale = node.publish_details.locale;
                        remoteDataCacheKey = typePrefix.toLowerCase() + '-assets-' + node.uid + '-' + publishedLocale;
                        _context.next = 7;
                        return cache.get(remoteDataCacheKey);

                      case 7:
                        cacheRemoteData = _context.sent;
                        url = '' + node.url;

                        // Avoid downloading the asset again if it's been cached

                        if (cacheRemoteData) {
                          fileNodeID = cacheRemoteData.fileNodeID;
                          touchNode({ nodeId: cacheRemoteData.fileNodeID });
                        }

                        // If we don't have cached data, download the file

                        if (fileNodeID) {
                          _context.next = 24;
                          break;
                        }

                        _context.prev = 11;
                        _context.next = 14;
                        return createRemoteFileNode({
                          url: url,
                          store: store,
                          cache: cache,
                          createNode: createNode,
                          createNodeId: createNodeId,
                          getCache: getCache,
                          reporter: reporter
                        });

                      case 14:
                        fileNode = _context.sent;

                        if (!fileNode) {
                          _context.next = 20;
                          break;
                        }

                        bar.tick();
                        fileNodeID = fileNode.id;
                        _context.next = 20;
                        return cache.set(remoteDataCacheKey, { fileNodeID: fileNodeID });

                      case 20:
                        _context.next = 24;
                        break;

                      case 22:
                        _context.prev = 22;
                        _context.t0 = _context['catch'](11);

                      case 24:

                        if (fileNodeID) {
                          node.localAssets___NODE = fileNodeID;
                        }

                        return _context.abrupt('return', node);

                      case 26:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, _callee, undefined, [[11, 22]]);
              }));

              return function (_x3) {
                return _ref2.apply(this, arguments);
              };
            }()));

          case 4:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function downloadAssets(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
exports.downloadAssets = downloadAssets;