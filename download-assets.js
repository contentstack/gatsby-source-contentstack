'use strict';

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

function runTask(concurrencyLimit, idleDelay, fn) {
  for (var _len = arguments.length, rest = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
    rest[_key - 3] = arguments[_key];
  }

  if (tasks.isPending() && tasks.totalActive < concurrencyLimit) {
    var item = tasks.getNext();
    console.log('Processing ' + item + ' Total Active Items ' + tasks.totalActive);

    rest[0].url = encodeURI(item.url);
    rest[0].parentNodeId = item.id;
    console.log('rest[0]', rest[0]);
    var fileNode = fn.apply(null, rest);

    if (fileNode) item.localAsset___NODE = fileNode.id;

    runTask.apply(undefined, [concurrencyLimit, idleDelay, fn].concat(rest));
  } else if (tasks.totalActive >= concurrencyLimit) {
    console.log('Hold state');
    setTimeout(function () {
      runTask.apply(undefined, [concurrencyLimit, idleDelay, fn].concat(rest));
    }, idleDelay);
  } else {
    if (!tasks.isCompleted()) setTimeout(function () {
      runTask.apply(undefined, [concurrencyLimit, idleDelay, fn].concat(rest));
    }, idleDelay);
  }
}