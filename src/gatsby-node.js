const {
  normalizeEntry,
  processContentType,
  processEntry,
  processAsset,
  makeEntryNodeUid,
  makeAssetNodeUid,
  buildCustomSchema,
} = require('./normalize');

const {
  fetchData,
  fetchContentTypes,
} = require('./fetch');

let contentTypes = [];
let references = [];
let groups = [];
exports.createSchemaCustomization = async ({
  actions,
  schema,
}, configOptions) => {
  try {
    contentTypes = await fetchContentTypes(configOptions);
  } catch (error) {
    console.error('Contentsatck fetch content type failed!');
  }
  if (configOptions.enableSchemaGeneration) {
    const typePrefix = configOptions.type_prefix || 'Contentstack';
    const {
      createTypes,
    } = actions;
    contentTypes.forEach((contentType) => {
      const contentTypeUid = ((contentType.uid).replace(/-/g, '_'));
      const name = `${typePrefix}_${contentTypeUid}`;
      const result = buildCustomSchema(contentType.schema, [], [], [], name, typePrefix);
      references = references.concat(result.references)
      groups = groups.concat(result.groups)
      const typeDefs = [
        `type linktype{
              title: String
              href: String
            }`,
        schema.buildObjectType({
          name,
          fields: result.fields,
          interfaces: ['Node'],
        }),
      ];
      result.types = result.types.concat(typeDefs);
      createTypes(result.types);
    });
  }
};

exports.sourceNodes = async ({
  actions,
  getNode,
  getNodes,
  createNodeId,
  store,
  reporter,
  createContentDigest,
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
  contentstackData.contentTypes = contentTypes;
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
  });

  syncData.entry_published && syncData.entry_published.forEach((item) => {
    const entryNodeId = makeEntryNodeUid(item.data, createNodeId, typePrefix);
    entriesNodeIds.add(entryNodeId);
  });

  syncData.asset_published && syncData.asset_published.forEach((item) => {
    const entryNodeId = makeAssetNodeUid(item.data, createNodeId, typePrefix);
    assetsNodeIds.add(entryNodeId);
  });

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


exports.createResolvers = ({
  createResolvers
}) => {
  let resolvers = {}
  references.forEach((reference) => {
    resolvers[reference.parent] = {
      ...resolvers[reference.parent],
      [reference.uid]: {
        resolve(source, args, context, info) {
          if (source[`${reference.uid}___NODE`]) {
            const nodesData = [];
            context.nodeModel.getAllNodes().find((node) => {
              source[`${reference.uid}___NODE`].forEach((id) => {
                if (node.id === id) {
                  nodesData.push(node);
                }
              });
            });
            return nodesData;
          }
          return [];
        },
      }
    }
  })
  groups.forEach((group) => {
    resolvers[group.parent] = {
      ...resolvers[group.parent],
      [group.field.uid]: {
        resolve: (source) => {
          if (group.field.multiple && !Array.isArray(source[group.field.uid])) {
            return [];
          }
          return source[group.field.uid] || null;
        },
      }
    }
  })
  createResolvers(resolvers)
}