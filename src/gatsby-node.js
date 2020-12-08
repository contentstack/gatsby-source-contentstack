const {
  normalizeEntry,
  processContentType,
  processEntry,
  processAsset,
  makeEntryNodeUid,
  makeAssetNodeUid,
  buildCustomSchema,
  extendSchemaWithDefaultEntryFields,
} = require('./normalize');
const {checkIfUnsupportedFormat,SUPPORTED_FILES_COUNT, IMAGE_REGEXP}=require('./utils');

const {
  fetchData,
  fetchContentTypes,
} = require('./fetch');

const downloadAssets = require('./download-assets');

let references = [];
let groups = [];

exports.onPreBootstrap = ({ reporter }) => {
  const args = process.argv;
  if (args.includes('--verbose')) {
    reporter.setVerbose(true);
  }
};

exports.createSchemaCustomization = async ({
  cache,
  actions,
  schema,
}, configOptions) => {

  let contentTypes;

  const typePrefix = configOptions.type_prefix || 'Contentstack';
  try {
    contentTypes = await fetchContentTypes(configOptions);
    await cache.set(typePrefix, contentTypes);
  } catch (error) {
    console.error('Contentstack fetch content type failed!');
  }
  if (configOptions.enableSchemaGeneration) {
    const {
      createTypes,
    } = actions;
    contentTypes.forEach((contentType) => {
      const contentTypeUid = ((contentType.uid).replace(/-/g, '_'));
      const name = `${typePrefix}_${contentTypeUid}`;
      const extendedSchema = extendSchemaWithDefaultEntryFields(contentType.schema);
      let result = buildCustomSchema(extendedSchema, [], [], [], name, typePrefix);
      references = references.concat(result.references);
      groups = groups.concat(result.groups);
      const typeDefs = [
        `type linktype{
              title: String
              href: String
            }`,
        schema.buildObjectType({
          name,
          fields: result.fields,
          interfaces: ['Node'],
          extensions: {infer: false}
        }),
      ];
      result.types = result.types.concat(typeDefs);
      createTypes(result.types);
    });
  }
};

exports.sourceNodes = async ({
  cache,
  actions,
  getNode,
  getNodes,
  createNodeId,
  store,
  reporter,
  createContentDigest,
  getNodesByType,
  getCache,
}, configOptions) => {
  const {
    createNode,
    deleteNode,
    touchNode,
    setPluginStatus,
  } = actions;
  let syncToken;
  const {
    status,
  } = store.getState();

  // use a custom type prefix if specified
  const typePrefix = configOptions.type_prefix || 'Contentstack';

  if (status && status.plugins && status.plugins['gatsby-source-contentstack']) {
    syncToken = status.plugins['gatsby-source-contentstack'][`${typePrefix.toLowerCase()}-sync-token-${configOptions.api_key}`];
  }

  configOptions.syncToken = syncToken || null;

  const {
    contentstackData,
  } = await fetchData(configOptions, reporter);
  contentstackData.contentTypes = await cache.get(typePrefix);
  const syncData = contentstackData.syncData.reduce((merged, item) => {
    if (!merged[item.type]) {
      merged[item.type] = [];
    }
    merged[item.type].push(item);
    return merged;
  }, {});

  // for checking if the reference node is present or not
  const entriesNodeIds = new Set();
  const assetsNodeIds = new Set();


  const existingNodes = getNodes().filter(
    (n) => n.internal.owner === 'gatsby-source-contentstack',
  );

  existingNodes.forEach((n) => {
    if (n.internal.type !== `${typePrefix}ContentTypes` && n.internal.type !== `${typePrefix}_assets`) {
      entriesNodeIds.add(n.id);
    }
    if (n.internal.type === `${typePrefix}_assets`) {
      assetsNodeIds.add(n.id);
    }
    touchNode({
      nodeId: n.id,
    });
    if (n.localAsset___NODE) {
      // Prevent GraphQL type inference from crashing on this property
      touchNode({ nodeId: n.localAsset___NODE });
    }
  });

  syncData.entry_published && syncData.entry_published.forEach((item) => {
    const entryNodeId = makeEntryNodeUid(item.data, createNodeId, typePrefix);
    entriesNodeIds.add(entryNodeId);
  });

  let countOfSupportedFormatFiles = 0;
  syncData.asset_published && syncData.asset_published.forEach(function (item) {
    /**
     * Get the count of assets (images), filtering out svg and gif format,
     * as these formats are not supported by gatsby-image.
     * We need the right count to render in progress bar,
     * which will show progress for downloading remote files.
     */
    if (configOptions.downloadAssets) {
      // Filter the images from the assets
      const regexp = IMAGE_REGEXP;
      let matches;
      let isUnsupportedExt;
      try {
        matches = regexp.exec(item.data.url);
        isUnsupportedExt = checkIfUnsupportedFormat(item.data.url);

        if (matches && !isUnsupportedExt)
          countOfSupportedFormatFiles++;

      } catch (error) {
        reporter.panic('Something went wrong. Details: ', error);
      }
    }
    var entryNodeId = makeAssetNodeUid(item.data, createNodeId, typePrefix);
    assetsNodeIds.add(entryNodeId);
  });
  // Cache the found count
 configOptions.downloadAssets && await cache.set(SUPPORTED_FILES_COUNT, countOfSupportedFormatFiles);
  // syncData.asset_published && syncData.asset_published.forEach((item) => {
  //   const entryNodeId = makeAssetNodeUid(item.data, createNodeId, typePrefix);
  //   assetsNodeIds.add(entryNodeId);
  // });

  // adding nodes
  contentstackData.contentTypes.forEach((contentType) => {
    contentType.uid = ((contentType.uid).replace(/-/g, '_'));
    const contentTypeNode = processContentType(contentType, createNodeId, createContentDigest, typePrefix);
    createNode(contentTypeNode);
  });

  syncData.entry_published && syncData.entry_published.forEach((item) => {
    item.content_type_uid = ((item.content_type_uid).replace(/-/g, '_'));
    const contentType = contentstackData.contentTypes.find((contentType) => item.content_type_uid === contentType.uid);
    const normalizedEntry = normalizeEntry(contentType, item.data, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix);
    const entryNode = processEntry(contentType, normalizedEntry, createNodeId, createContentDigest, typePrefix);
    createNode(entryNode);
  });

  syncData.asset_published && syncData.asset_published.forEach((item) => {
    const assetNode = processAsset(item.data, createNodeId, createContentDigest, typePrefix);
    createNode(assetNode);
  });

  if (configOptions.downloadAssets) {
    try {
      await downloadAssets({ cache, getCache, createNode, createNodeId, getNodesByType, reporter }, typePrefix, configOptions);
    } catch (error) {
      console.log('error--->', error);
      reporter.info('Something went wrong while downloading assets. Details: ' + error);
    }
  }

  function deleteContentstackNodes(item, type) {
    let nodeId = '';
    let node = null;
    if (type === 'entry') {
      nodeId = createNodeId(`${typePrefix.toLowerCase()}-entry-${item.uid}-${item.locale}`);
    }
    if (type === 'asset') {
      nodeId = createNodeId(`${typePrefix.toLowerCase()}-assets-${item.uid}-${item.locale}`);
    }
    node = getNode(nodeId);
    if (node) {
      deleteNode({
        node,
      });
    }
  }

  // deleting nodes

  syncData.entry_unpublished && syncData.entry_unpublished.forEach((item) => {
    deleteContentstackNodes(item.data, 'entry');
  });

  syncData.asset_unpublished && syncData.asset_unpublished.forEach((item) => {
    deleteContentstackNodes(item.data, 'asset');
  });

  syncData.entry_deleted && syncData.entry_deleted.forEach((item) => {
    deleteContentstackNodes(item.data, 'entry');
  });

  syncData.asset_deleted && syncData.asset_deleted.forEach((item) => {
    deleteContentstackNodes(item.data, 'asset');
  });

  syncData.content_type_deleted && syncData.content_type_deleted.forEach((item) => {
    item.content_type_uid = ((item.content_type_uid).replace(/-/g, '_'));
    const sameContentTypeNodes = getNodes().filter(
      (n) => n.internal.type === `${typePrefix}_${item.content_type_uid}`,
    );
    sameContentTypeNodes.forEach((node) => deleteNode({
      node,
    }));
  });

  // Updating the syncToken
  const nextSyncToken = contentstackData.sync_token;

  // Storing the sync state for the next sync
  const newState = {};
  newState[`${typePrefix.toLowerCase()}-sync-token-${configOptions.api_key}`] = nextSyncToken;
  setPluginStatus(newState);
};

// exports.onCreateNode = async ({
//   cache,
//   actions: { createNode },
//   getCache,
//   createNodeId,
//   node,
// }, configOptions) => {
//   // use a custom type prefix if specified
//   const typePrefix = configOptions.type_prefix || 'Contentstack';

//   // filter the images from all the assets
//   // const regexp = new RegExp('https://(images).contentstack.io/v3/assets/')
//   // const matches = regexp.exec(node.url);

//   if (configOptions.downloadAssets && node.internal.owner === 'gatsby-source-contentstack' && node.internal.type === `${typePrefix}_assets`) {
//     const cachedNodeId = makeAssetNodeUid(node, createNodeId, typePrefix);

//     const cachedFileNode = await cache.get(cachedNodeId);

//     let fileNode;
//     // Checks for cached fileNode
//     if (cachedFileNode) {
//       fileNode = cachedFileNode;
//     } else {
//       // create a FileNode in Gatsby that gatsby-transformer-sharp will create optimized images for
//       fileNode = await createRemoteFileNode({
//         // the url of the remote image to generate a node for
//         url: encodeURI(node.url),
//         getCache,
//         createNode,
//         createNodeId,
//         parentNodeId: node.id,
//       });

//       if (fileNode)
//         // Cache the fileNode, so it does not have to downloaded again
//         await cache.set(cachedNodeId, fileNode);
//     }

//     if (fileNode)
//       node.localAsset___NODE = fileNode.id;
//   }
// };

exports.createResolvers = ({ createResolvers }) => {
  const resolvers = {};
  references.forEach((reference) => {
    resolvers[reference.parent] = {
      ...resolvers[reference.parent],
      [reference.uid]: {
        resolve(source, args, context, info) {
          if (source[`${reference.uid}___NODE`]) {
            const nodesData = [];
            source[`${reference.uid}___NODE`].forEach((id) => {
              context.nodeModel.getAllNodes().find((node) => {
                if (node.id === id) {
                  nodesData.push(node);
                }
              });
            });
            return nodesData;
          }
          return [];
        },
      },
    };
  });
  groups.forEach((group) => {
    resolvers[group.parent] = {
      ...resolvers[group.parent],
      ...{
        [group.field.uid]: {
          resolve: (source) => {
            if (group.field.multiple && !Array.isArray(source[group.field.uid])) {
              return [];
            }
            return source[group.field.uid] || null;
          },
        },
      },
    };
  });
  createResolvers(resolvers);
};
