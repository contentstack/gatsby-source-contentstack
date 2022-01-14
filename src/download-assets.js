'use strict';

const { createRemoteFileNode } = require('gatsby-source-filesystem');

const { makeAssetNodeUid } = require('./normalize');
const { createProgress, checkIfUnsupportedFormat, SUPPORTED_FILES_COUNT, IMAGE_REGEXP, ASSET_NODE_UIDS } = require('./utils');

let bar; // Keep track of the total number of jobs we push in the queue
let sizeBar;
let totalJobs = 0;
let totalSize = 0;

module.exports = async ({ cache, getCache, createNode, createNodeId, getNodesByType, reporter, createNodeField, getNode }, typePrefix, configOptions) => {
  try {
    const assetUids = await cache.get(ASSET_NODE_UIDS);

    configOptions.MAX_CONCURRENCY_LIMIT = process.env.GATSBY_CONCURRENT_DOWNLOAD || 20;

    const batches = getBatches(assetUids.length, configOptions.MAX_CONCURRENCY_LIMIT);

    // Get total count of files that will be downloaded, excluding unsupported formats
    totalJobs = await cache.get(SUPPORTED_FILES_COUNT);
    // Create progress bar
    bar = createProgress(`Downloading remote files`, reporter);
    bar.start();
    bar.total = totalJobs;

    for (let i = 0; i < batches.length; i++) {

      const batchPromises = [];

      const skip = i * configOptions.MAX_CONCURRENCY_LIMIT;

      const lastCount = (i + 1) * configOptions.MAX_CONCURRENCY_LIMIT;
      reporter.verbose(`Skip: ${skip}, limit: ${lastCount}`);

      let shouldBreak = false;
      for (let j = skip; j < lastCount; j++) {
        const asset = assetUids[j] ? getNode(assetUids[j]) : null;
        // Last batch will contain null references when accessed, can be handled in a better way
        if (!asset && (i + 1) === batches.length) {
          shouldBreak = true;
          break;
        }

        // filter the images from all the assets
        const regexp = IMAGE_REGEXP;

        let matches;
        // SVG is not supported by gatsby-source-filesystem. Reference: https://github.com/gatsbyjs/gatsby/issues/10297
        let isUnsupportedExt = false;
        try {
          matches = regexp.exec(asset.url);
          isUnsupportedExt = checkIfUnsupportedFormat(asset.url);
        } catch (error) {
          reporter.panic('Something went wrong. Details: ' + JSON.stringify(error));
        }

        if (matches && !isUnsupportedExt) {
          batchPromises.push(
            await createRemoteFileNodePromise({
              cache, getCache, createNode, createNodeId, createNodeField,
            }, asset, typePrefix, reporter)
          );
        }
      }
      // To track last batch
      if (shouldBreak)
        break;

      await Promise.all(batchPromises);
    }

    bar && bar.done();
    sizeBar && sizeBar.done();
    reporter.verbose(`Total size of downloaded files ${totalSize}`);

  } catch (error) {
    reporter.info('Something went wrong while downloading assets. Details: ' + error);
  }

};

const createRemoteFileNodePromise = async (params, node, typePrefix, reporter) => {
  try {
    if (!sizeBar) {
      sizeBar = createProgress(`Total KBs downloaded`, reporter);
      sizeBar.start();
    }

    let fileNode;

    const assetUid = makeAssetNodeUid(node, params.createNodeId, typePrefix);

    // Get asset from cache
    fileNode = await params.cache.get(assetUid);

    // Handles condition if the asset has been updated, then it will be downloaded again
    if (fileNode && fileNode.updated_at !== node.updated_at)
      fileNode = null;

    if (!fileNode) {
      fileNode = await createRemoteFileNode({ ...params, url: encodeURI(node.url), parentNodeId: node.id });

      if (fileNode) {
        // Save updated_at value in the cached fileNode
        fileNode.updated_at = node.updated_at;
        
        const fileSize = parseInt(fileNode.size / 1000);  // Get size in megabytes
        totalSize = totalSize + fileSize;
        sizeBar.total = totalSize;
        sizeBar.tick(fileSize);
        // Cache fileNode to prevent re-downloading asset
        await params.cache.set(assetUid, fileNode);
      }
    }

    bar.tick();
    if (fileNode) {
      params.createNodeField({ node, name: 'localAsset', value: fileNode.id });
    }

    return fileNode;
  } catch (error) {
    reporter.info('Something went wrong while creating file nodes. Details: ' + error);
  }
};

const getBatches = (count, batchLimit) => {
  const partitions = Math.ceil(count / batchLimit);
  // Returns array filled with indexes
  return Array(partitions).fill(null).map((_, i) => i);
};
