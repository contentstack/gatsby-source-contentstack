'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var runTask = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(concurrencyLimit, idleDelay, fn) {
    for (var _len = arguments.length, rest = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      rest[_key - 3] = arguments[_key];
    }

    var _item;

    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!(tasks.isPending() && tasks.totalActive < concurrencyLimit)) {
              _context2.next = 8;
              break;
            }

            _item = tasks.getNext();

            console.log('Processing ' + _item + ' Total Active Items ' + tasks.totalActive);

            _context2.next = 5;
            return processDownload(_item, fn, rest);

          case 5:

            runTask.apply(undefined, [concurrencyLimit, idleDelay, fn].concat(rest));

            _context2.next = 9;
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
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function runTask(_x4, _x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('gatsby-source-filesystem'),
    createRemoteFileNode = _require.createRemoteFileNode;

module.exports = function (_ref, typePrefix, configOptions) {
  var getCache = _ref.getCache,
      createNode = _ref.createNode,
      createNodeId = _ref.createNodeId,
      getNodesByType = _ref.getNodesByType;

  var assets = getNodesByType(typePrefix + '_assets');

  tasks.getTotalTasks(assets); // Get total tasks to be performed
  for (var i = 0; i < assets.length; i++) {
    tasks.add(assets[i]);
  }runTask(configOptions.MAX_CONCURRENCY_LIMIT || 20, configOptions.IDLE_DELAY || 100, createRemoteFileNode, {
    getCache: getCache,
    createNode: createNode,
    createNodeId: createNodeId
  });
};

var processDownload = function () {
  var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(node, fn, params) {
    var fileNode;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:

            params[0].url = encodeURI(node.url);
            params[0].parentNodeId = node.id;
            console.log('params[0]', params[0]);
            _context.next = 5;
            return fn.apply(null, params);

          case 5:
            fileNode = _context.sent;


            tasks.done(item);

            if (fileNode) item.localAsset___NODE = fileNode.id;

          case 8:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function processDownload(_x, _x2, _x3) {
    return _ref2.apply(this, arguments);
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