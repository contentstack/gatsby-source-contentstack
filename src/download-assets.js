'use strict';

const { createRemoteFileNode } = require('gatsby-source-filesystem');

module.exports = ({
  getCache,
  createNode,
  createNodeId,
  getNodesByType
}, typePrefix, configOptions) => {
  const assets = getNodesByType(`${typePrefix}_assets`);

  tasks.getTotalTasks(assets); // Get total tasks to be performed
  for (let i = 0; i < assets.length; i++)
    tasks.add(assets[i]);

  runTask(
    configOptions.MAX_CONCURRENCY_LIMIT || 20,
    configOptions.IDLE_DELAY || 100,
    createRemoteFileNode,
    {
      getCache,
      createNode,
      createNodeId,
    }
  );
};

const tasks = {
  queue: [],
  totalActive: 0,
  totalCompleted: 0,
  totalTasks: 0,
  getTotalTasks: function (items) {
    this.totalTasks = items.length;
  },
  add: function (item) {
    if (!item || item.length === 0)
      return;

    const q = this.queue;
    q.push(item);
  },
  done: function () {
    this.totalCompleted++;
    this.totalActive--;
  },
  getNext: function () {
    this.totalActive++;
    // It will remove the returned item from queue
    return this.queue.shift();
  },
  isPending: function () {
    return this.queue.length > 0;
  },
  isCompleted: function () {
    return this.totalCompleted === this.totalTasks;
  }
};

function runTask(concurrencyLimit, idleDelay, fn, ...rest) {
  if (tasks.isPending() && tasks.totalActive < concurrencyLimit) {
    const item = tasks.getNext();
    console.log('Processing ' + item + ' Total Active Items ' + tasks.totalActive);

    rest[0].url = encodeURI(item.url);
    rest[0].parentNodeId = item.id;
    console.log('rest[0]', rest[0]);
    const fileNode = fn.apply(null, rest);

    if (fileNode)
      item.localAsset___NODE = fileNode.id;

    runTask(concurrencyLimit, idleDelay, fn, ...rest);

  } else if (tasks.totalActive >= concurrencyLimit) {
    console.log('Hold state');
    setTimeout(function () {
      runTask(concurrencyLimit, idleDelay, fn, ...rest);
    }, idleDelay);

  } else {
    if (!tasks.isCompleted())
      setTimeout(function () {
        runTask(concurrencyLimit, idleDelay, fn, ...rest);
      }, idleDelay);
  }
}