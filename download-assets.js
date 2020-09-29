'use strict';

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var runTask = function () {
  var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(concurrencyLimit, idleDelay, fn) {
    for (var _len = arguments.length, rest = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      rest[_key - 3] = arguments[_key];
    }

    var item;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (!(tasks.isPending() && tasks.totalActive < concurrencyLimit)) {
              _context4.next = 8;
              break;
            }

            item = tasks.getNext();

            console.log('Processing ' + item.url + ' Total Active Items ' + tasks.totalActive);

            _context4.next = 5;
            return processDownload(item, fn, rest);

          case 5:

            runTask.apply(undefined, [concurrencyLimit, idleDelay, fn].concat(rest));

            _context4.next = 9;
            break;

          case 8:
            if (tasks.totalActive >= concurrencyLimit) {
              console.log('Hold state');
              setTimeout(function () {
                runTask.apply(undefined, [concurrencyLimit, idleDelay, fn].concat(rest));
              }, idleDelay);
            } else {
              if (!tasks.isCompleted()) setTimeout(function () {
                runTask.apply(undefined, [concurrencyLimit, idleDelay, fn].concat(rest));
              }, idleDelay);
            }

          case 9:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function runTask(_x9, _x10, _x11) {
    return _ref5.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('gatsby-source-filesystem'),
    createRemoteFileNode = _require.createRemoteFileNode;

module.exports = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref2, typePrefix, configOptions) {
    var getCache = _ref2.getCache,
        createNode = _ref2.createNode,
        createNodeId = _ref2.createNodeId,
        getNodesByType = _ref2.getNodesByType;
    var assets, batches, i, batchPromises, skip, lastCount, shouldBreak, j;
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
              _context.next = 30;
              break;
            }

            batchPromises = [];
            skip = i * MAX_CONCURRENCY_LIMIT;
            lastCount = (i + 1) * MAX_CONCURRENCY_LIMIT;

            console.log('skip', skip, 'lastCount', lastCount);

            shouldBreak = false;
            j = skip;

          case 11:
            if (!(j < lastCount)) {
              _context.next = 23;
              break;
            }

            if (assets[j]) {
              _context.next = 15;
              break;
            }

            shouldBreak = true;
            return _context.abrupt('break', 23);

          case 15:
            _context.t0 = batchPromises;
            _context.next = 18;
            return createRemoteFileNodePromise({
              getCache: getCache,
              createNode: createNode,
              createNodeId: createNodeId
            }, assets[j]);

          case 18:
            _context.t1 = _context.sent;

            _context.t0.push.call(_context.t0, _context.t1);

          case 20:
            j++;
            _context.next = 11;
            break;

          case 23:
            if (!shouldBreak) {
              _context.next = 25;
              break;
            }

            return _context.abrupt('break', 30);

          case 25:
            _context.next = 27;
            return _promise2.default.all(batchPromises);

          case 27:
            i++;
            _context.next = 4;
            break;

          case 30:
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
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(params, node) {
    var fileNode;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return createRemoteFileNode((0, _extends3.default)({}, params, {
              url: encodeURI(node.url),
              parentNodeId: node.id
            }));

          case 2:
            fileNode = _context2.sent;

            if (fileNode) node.localAsset___NODE = fileNode.id;

          case 4:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function createRemoteFileNodePromise(_x4, _x5) {
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

var processDownload = function () {
  var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(node, fn, params) {
    var fileNode;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:

            params[0].url = encodeURI(node.url);
            params[0].parentNodeId = node.id;
            console.log('params[0]', params[0]);
            _context3.next = 5;
            return fn.apply(null, params);

          case 5:
            fileNode = _context3.sent;


            tasks.done(node);

            if (fileNode) node.localAsset___NODE = fileNode.id;

          case 8:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function processDownload(_x6, _x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();

var tasks = {
  queue: [],
  totalActive: 0,
  totalCompleted: 0,
  totalTasks: 0,
  getTotalTasks: function getTotalTasks(items) {
    this.totalTasks = items.length;
  },
  add: function add(item) {
    if (!item || item.length === 0) return;

    var q = this.queue;
    q.push(item);
  },
  done: function done() {
    this.totalCompleted++;
    this.totalActive--;
  },
  getNext: function getNext() {
    this.totalActive++;
    // It will remove the returned item from queue
    return this.queue.shift();
  },
  isPending: function isPending() {
    return this.queue.length > 0;
  },
  isCompleted: function isCompleted() {
    return this.totalCompleted === this.totalTasks;
  }
};