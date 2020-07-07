const ProgressBar = require('progress');
const { createRemoteFileNode } = require('gatsby-source-filesystem');

const bar = new ProgressBar(
  'Downloading Contentstack Assets [:bar] :current/:total :elapsed secs :percent',
  {
    total: 0,
    width: 30,
  },
);

let totalJobs = 0;

/**
 * @name downloadAssets
 * @description Downloads assets to the local filesystem.
 * The asset files will be downloaded and cached. Use `localAsset` to link to them
 * @param gatsbyFunctions - Gatsby's internal helper functions
 */

const downloadAssets = async (gatsbyFunctions, typePrefix) => {
  const {
    actions: { createNode, touchNode },
    createNodeId,
    store,
    cache,
    getCache,
    getNodes,
    reporter,
  } = gatsbyFunctions;

  // Any Contentstack_asset nodes will be downloaded, cached and copied to public/static
  // regardless of if you use `localAsset` to link an asset or not.
  const assetsNodes = getNodes().filter(
    (n) => n.internal.owner === 'gatsby-source-contentstack'
      && n.internal.type === `${typePrefix}_assets`,
  );

  await Promise.all(
    assetsNodes.map(async (node) => {
      totalJobs += 1;
      bar.total = totalJobs;

      let fileNodeID;
      const publishedLocale = node.publish_details.locale;
      const remoteDataCacheKey = `${typePrefix.toLowerCase()}-assets-${node.uid}-${publishedLocale}`;
      const cacheRemoteData = await cache.get(remoteDataCacheKey);
      const url = `${node.url}`;

      // Avoid downloading the asset again if it's been cached
      if (cacheRemoteData) {
        fileNodeID = cacheRemoteData.fileNodeID;
        touchNode({ nodeId: cacheRemoteData.fileNodeID });
      }

      // If we don't have cached data, download the file
      if (!fileNodeID) {
        try {
          const fileNode = await createRemoteFileNode({
            url,
            store,
            cache,
            createNode,
            createNodeId,
            getCache,
            reporter,
          });

          if (fileNode) {
            bar.tick();
            fileNodeID = fileNode.id;
            await cache.set(remoteDataCacheKey, { fileNodeID });
          }
        } catch (err) {
          // Ignore
        }
      }

      if (fileNodeID) {
        node.localAssets___NODE = fileNodeID;
      }

      return node;
    }),
  );
};
exports.downloadAssets = downloadAssets;
