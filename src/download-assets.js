'use strict';

const { createRemoteFileNode } = require('gatsby-source-filesystem');

const { makeAssetNodeUid } = require('./normalize');
const { createProgress, checkIfSvg } = require('./utils');

let bar; // Keep track of the total number of jobs we push in the queue
let totalJobs = 0;

module.exports = async ({
  cache,
  getCache,
  createNode,
  createNodeId,
  getNodesByType,
  reporter
}, typePrefix, configOptions) => {

  try {
    const assets = getNodesByType(`${typePrefix}_assets`);

    configOptions.MAX_CONCURRENCY_LIMIT = configOptions.MAX_CONCURRENCY_LIMIT || 20;

    const batches = getBatches(assets.length, configOptions.MAX_CONCURRENCY_LIMIT);

    for (let i = 0; i < batches.length; i++) {

      const batchPromises = [];

      const skip = i * configOptions.MAX_CONCURRENCY_LIMIT;

      const lastCount = (i + 1) * configOptions.MAX_CONCURRENCY_LIMIT;
      reporter.info(`Skip: ${skip}, limit: ${lastCount}`);

      let shouldBreak = false;
      for (let j = skip; j < lastCount; j++) {
        // Last batch will contain null references when accessed, can be handled in a better way
        if (!assets[j] && i === batches.length) {
          shouldBreak = true;
          break;
        }

        // filter the images from all the assets
        const regexp = new RegExp('https://(images).contentstack.io/v3/assets/');
        const matches = regexp.exec(assets[j].url);
        // SVG is not supported by gatsby-source-filesystem. Reference: https://github.com/gatsbyjs/gatsby/issues/10297
        let isSvgExt = false;
        try {
          isSvgExt = checkIfSvg(assets[j].url);
        } catch (error) {
          reporter.panic('Something went wrong.', JSON.stringify(error));
        }

        // Only download images
        if (matches && !isSvgExt) {

          batchPromises.push(
            await createRemoteFileNodePromise({
              cache, getCache, createNode, createNodeId,
            }, assets[j], typePrefix, reporter)
          );
        }
      }
      // To track last batch
      if (shouldBreak)
        break;

      await Promise.all(batchPromises);
    }

    bar && bar.done();

  } catch (error) {
    reporter.panic('Something went wrong while downloading assets: ', JSON.stringify(error));
    throw error;
  }

};

const createRemoteFileNodePromise = async (params, node, typePrefix, reporter) => {
  try {
    if (totalJobs === 0) {
      bar = createProgress(`Downloading remote files`, reporter);
      bar.start();
    }

    totalJobs += 1;
    bar.total = totalJobs;

    let fileNode;

    const assetUid = makeAssetNodeUid(node, params.createNodeId, typePrefix);

    // Get asset from cache
    fileNode = await params.cache.get(assetUid);

    if (!fileNode) {
      fileNode = await createRemoteFileNode({ ...params, url: encodeURI(node.url), parentNodeId: node.id });

      // Cache fileNode to prevent re-downloading asset
      await params.cache.set(assetUid, fileNode);
    }

    bar.tick();

    if (fileNode)
      node.localAsset___NODE = fileNode.id;

    return fileNode;

  } catch (error) {
    reporter.panic('Something went wrong while creating file nodes: ', JSON.stringify(error));
    throw error;
  }
};

const getBatches = (count, batchLimit) => {
  const partitions = Math.ceil(count / batchLimit);
  // Returns array filled with indexes
  return Array(partitions).fill(null).map((_, i) => i);
};
