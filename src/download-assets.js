'use strict';

const { createRemoteFileNode } = require('gatsby-source-filesystem');

module.exports = async ({
  getCache,
  createNode,
  createNodeId,
  getNodesByType
}, typePrefix, configOptions) => {
  const assets = getNodesByType(`${typePrefix}_assets`);

  configOptions.MAX_CONCURRENCY_LIMIT = configOptions.MAX_CONCURRENCY_LIMIT || 20;

  const batches = getBatches(assets.length, configOptions.MAX_CONCURRENCY_LIMIT);

  for (let i = 0; i < batches.length; i++) {

    const batchPromises = [];

    const skip = i * MAX_CONCURRENCY_LIMIT;

    const lastCount = (i + 1) * MAX_CONCURRENCY_LIMIT;
    console.log('skip', skip, 'lastCount', lastCount);

    let shouldBreak = false;
    for (let j = skip; j < lastCount; j++) {
      // Last batch will contain null references when accessed, can be handled in a better way
      if (!assets[j]) {
        shouldBreak = true;
        break;
      }

      batchPromises.push(
        await createRemoteFileNodePromise({
          getCache,
          createNode,
          createNodeId,
        }, assets[j])
      );
    }
    if (shouldBreak)
      break;

    await Promise.all(batchPromises);
  }
};

const createRemoteFileNodePromise = async (params, node) => {
  const fileNode = await createRemoteFileNode({
    ...params,
    url: encodeURI(node.url),
    parentNodeId: node.id
  });
  if (fileNode)
    node.localAsset___NODE = fileNode.id;
};

const getBatches = (count, batchLimit) => {
  const partitions = Math.ceil(count / batchLimit);
  // Returns array filled with indexes
  return Array(partitions).fill(null).map((_, i) => i);
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

const processDownload = async (node, fn, params) => {

  params[0].url = encodeURI(node.url);
  params[0].parentNodeId = node.id;
  console.log('params[0]', params[0]);
  const fileNode = await fn.apply(null, params);

  tasks.done(node);

  if (fileNode)
    node.localAsset___NODE = fileNode.id;
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

async function runTask(concurrencyLimit, idleDelay, fn, ...rest) {
  if (tasks.isPending() && tasks.totalActive < concurrencyLimit) {
    const item = tasks.getNext();
    console.log('Processing ' + item.url + ' Total Active Items ' + tasks.totalActive);

    await processDownload(item, fn, rest);

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