'use strict';

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('gatsby-source-filesystem'),
    createRemoteFileNode = _require.createRemoteFileNode;

var _require2 = require('./normalize'),
    makeAssetNodeUid = _require2.makeAssetNodeUid;

var _require3 = require('./utils'),
    createProgress = _require3.createProgress;

var bar = void 0; // Keep track of the total number of jobs we push in the queue
var totalJobs = 0;

module.exports = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref2, typePrefix, configOptions) {
    var cache = _ref2.cache,
        getCache = _ref2.getCache,
        createNode = _ref2.createNode,
        createNodeId = _ref2.createNodeId,
        getNodesByType = _ref2.getNodesByType,
        reporter = _ref2.reporter;
    var assets, batches, i, batchPromises, skip, lastCount, shouldBreak, j, regexp, matches;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            assets = getNodesByType(typePrefix + '_assets');


            configOptions.MAX_CONCURRENCY_LIMIT = configOptions.MAX_CONCURRENCY_LIMIT || 20;

            batches = getBatches(assets.length, configOptions.MAX_CONCURRENCY_LIMIT);
            i = 0;

          case 4:
            if (!(i < batches.length)) {
              _context.next = 34;
              break;
            }

            batchPromises = [];
            skip = i * configOptions.MAX_CONCURRENCY_LIMIT;
            lastCount = (i + 1) * configOptions.MAX_CONCURRENCY_LIMIT;

            console.log('skip', skip, 'lastCount', lastCount);
            reporter.info('Skip: ' + skip + ', limit: ' + lastCount);

            shouldBreak = false;
            j = skip;

          case 12:
            if (!(j < lastCount)) {
              _context.next = 27;
              break;
            }

            if (!(!assets[j] && i === batches.length)) {
              _context.next = 16;
              break;
            }

            shouldBreak = true;
            return _context.abrupt('break', 27);

          case 16:

            // filter the images from all the assets
            regexp = new RegExp('https://(images).contentstack.io/v3/assets/');
            matches = regexp.exec(assets[j].url);
            // Only download images

            if (!matches) {
              _context.next = 24;
              break;
            }

            _context.t0 = batchPromises;
            _context.next = 22;
            return createRemoteFileNodePromise({
              cache: cache,
              getCache: getCache,
              createNode: createNode,
              createNodeId: createNodeId
            }, assets[j], typePrefix, reporter);

          case 22:
            _context.t1 = _context.sent;

            _context.t0.push.call(_context.t0, _context.t1);

          case 24:
            j++;
            _context.next = 12;
            break;

          case 27:
            if (!shouldBreak) {
              _context.next = 29;
              break;
            }

            return _context.abrupt('break', 34);

          case 29:
            _context.next = 31;
            return _promise2.default.all(batchPromises);

          case 31:
            i++;
            _context.next = 4;
            break;

          case 34:

            if (bar) bar.done();

          case 35:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var createRemoteFileNodePromise = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(params, node, typePrefix, reporter) {
    var fileNode, assetUid;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (totalJobs === 0) {
              bar = createProgress('Downloading remote files', reporter);
              bar.start();
            }

            totalJobs += 1;
            bar.total = totalJobs;

            fileNode = void 0;
            assetUid = makeAssetNodeUid(node, params.createNodeId, typePrefix);

            // Get asset from cache

            _context2.next = 7;
            return params.cache.get(assetUid);

          case 7:
            fileNode = _context2.sent;

            if (fileNode) {
              _context2.next = 14;
              break;
            }

            _context2.next = 11;
            return createRemoteFileNode((0, _extends3.default)({}, params, {
              url: encodeURI(node.url),
              parentNodeId: node.id
            }));

          case 11:
            fileNode = _context2.sent;
            _context2.next = 14;
            return params.cache.set(assetUid, fileNode);

          case 14:

            bar.tick();

            if (fileNode) node.localAsset___NODE = fileNode.id;

            return _context2.abrupt('return', fileNode);

          case 17:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
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

// module.exports = ({
//   getCache,
//   createNode,
//   createNodeId,
//   getNodesByType
// }, typePrefix, configOptions) => {
//   const assets = getNodesByType(`${typePrefix}_assets`);

//   tasks.getTotalTasks(assets); // Get total tasks to be performed
//   for (let i = 0; i < assets.length; i++)
//     tasks.add(assets[i]);

//   runTask(
//     configOptions.MAX_CONCURRENCY_LIMIT || 20,
//     configOptions.IDLE_DELAY || 100,
//     createRemoteFileNode,
//     {
//       getCache,
//       createNode,
//       createNodeId,
//     }
//   );
// };

// const processDownload = async (node, fn, params) => {

//   params[0].url = encodeURI(node.url);
//   params[0].parentNodeId = node.id;
//   console.log('params[0]', params[0]);
//   const fileNode = await fn.apply(null, params);

//   tasks.done(node);

//   if (fileNode)
//     node.localAsset___NODE = fileNode.id;
// };

// const tasks = {
//   queue: [],
//   totalActive: 0,
//   totalCompleted: 0,
//   totalTasks: 0,
//   getTotalTasks: function (items) {
//     this.totalTasks = items.length;
//   },
//   add: function (item) {
//     if (!item || item.length === 0)
//       return;

//     const q = this.queue;
//     q.push(item);
//   },
//   done: function () {
//     this.totalCompleted++;
//     this.totalActive--;
//   },
//   getNext: function () {
//     this.totalActive++;
//     // It will remove the returned item from queue
//     return this.queue.shift();
//   },
//   isPending: function () {
//     return this.queue.length > 0;
//   },
//   isCompleted: function () {
//     return this.totalCompleted === this.totalTasks;
//   }
// };

// async function runTask(concurrencyLimit, idleDelay, fn, ...rest) {
//   if (tasks.isPending() && tasks.totalActive < concurrencyLimit) {
//     const item = tasks.getNext();
//     console.log('Processing ' + item.url + ' Total Active Items ' + tasks.totalActive);

//     await processDownload(item, fn, rest);

//     runTask(concurrencyLimit, idleDelay, fn, ...rest);

//   } else if (tasks.totalActive >= concurrencyLimit) {
//     console.log('Hold state');
//     setTimeout(function () {
//       runTask(concurrencyLimit, idleDelay, fn, ...rest);
//     }, idleDelay);

//   } else {
//     if (!tasks.isCompleted())
//       setTimeout(function () {
//         runTask(concurrencyLimit, idleDelay, fn, ...rest);
//       }, idleDelay);
//   }
// }