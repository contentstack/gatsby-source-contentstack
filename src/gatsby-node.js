const {
  normalizeEntry,
  processContentType,
  processEntry,
  processAsset,
  makeEntryNodeUid,
  makeAssetNodeUid
} = require("./normalize");

const { fetchData , fetchContentTypes} = require("./fetch");

let contentTypes = [];

exports.createSchemaCustomization = async ({ actions, schema }, configOptions) => {
  try {
    contentTypes = await fetchContentTypes(configOptions);
  } catch(error) {
    console.error('Contentsatck fetch content type failed!');
  }
  console.log('called', contentTypes.length, '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
  const typePrefix = configOptions.type_prefix || 'Contentstack'
  const { createTypes } = actions
  contentTypes.forEach((contentType) => {
    let type = `${typePrefix}_${contentType.uid}`
    console.log(type, 'type>>')
    buildCustomSchema(contentType);
  });
  const typeDefs = [
    schema.buildObjectType({
      name: "Contentstack_test1234",
      fields: {
        title: "String!",
        url: "String!",
        number: "Int",
      },
      interfaces: ["Node"],
    }),
  ]
  createTypes(typeDefs)
}
exports.sourceNodes = async ({
  actions,
  getNode,
  getNodes,
  createNodeId,
  store,
  reporter,
  createContentDigest
}, configOptions) => {
  const {
    createNode,
    deleteNode,
    touchNode,
    setPluginStatus
  } = actions;
  let syncToken;
  const status = store.getState().status;
  console.log('sourcenodes called>>>>>>>>>>>>>>>>>>>>>>>>')
  // use a custom type prefix if specified
  const typePrefix = configOptions.type_prefix || 'Contentstack'

  if (status && status.plugins && status.plugins[`gatsby-source-contentstack`]) {
    syncToken = status.plugins[`gatsby-source-contentstack`][`${typePrefix.toLowerCase()}-sync-token-${configOptions.api_key}`]
  }

  configOptions.syncToken = syncToken || null;

  const {
    contentstackData
  } = await fetchData(configOptions, reporter);
  contentstackData.contentTypes = contentTypes
  console.log(contentstackData.contentTypes.length, 'length');
  const syncData = contentstackData.syncData.reduce((merged, item) => {
    if (!merged[item.type]) {
      merged[item.type] = [];
    }
    merged[item.type].push(item);
    return merged;
  }, {});

  // for checking if the reference node is present or not
  let entriesNodeIds = new Set();
  let assetsNodeIds = new Set();


  const existingNodes = getNodes().filter(
    n => n.internal.owner === `gatsby-source-contentstack`
  );

  existingNodes.forEach(n => {
    if (n.internal.type !== `${typePrefix}ContentTypes` && n.internal.type !== `${typePrefix}_assets`) {
      entriesNodeIds.add(n.id);
    }
    if (n.internal.type === `${typePrefix}_assets`) {
      assetsNodeIds.add(n.id);
    }
    touchNode({
      nodeId: n.id
    });
  });

  syncData['entry_published'] && syncData['entry_published'].forEach(item => {
    let entryNodeId = makeEntryNodeUid(item.data, createNodeId, typePrefix);
    entriesNodeIds.add(entryNodeId);
  });

  syncData['asset_published'] && syncData['asset_published'].forEach(item => {
    let entryNodeId = makeAssetNodeUid(item.data, createNodeId, typePrefix);
    assetsNodeIds.add(entryNodeId);
  });

  // adding nodes

  syncData['entry_published'] && syncData['entry_published'].forEach(item => {
    const contentType = contentstackData.contentTypes.find(function (contentType) {
      return item.content_type_uid === contentType.uid;
    });
    const normalizedEntry = normalizeEntry(contentType, item.data, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix);
    const entryNode = processEntry(contentType, normalizedEntry, createNodeId, createContentDigest, typePrefix);
    createNode(entryNode);
  });

  syncData['asset_published'] && syncData['asset_published'].forEach(item => {
    const assetNode = processAsset(item.data, createNodeId, createContentDigest, typePrefix);
    createNode(assetNode);
  });

  contentstackData.contentTypes.forEach(contentType => {
    const contentTypeNode = processContentType(contentType, createNodeId, createContentDigest, typePrefix);
    createNode(contentTypeNode);
  });


  function deleteContentstackNodes(item, type) {
    let nodeId = '';
    let node = null;
    if (type === 'entry') {
      nodeId = createNodeId(`${typePrefix.toLowerCase()}-entry-${item.uid}-${item.locale}`)
    }
    if (type === 'asset') {
      nodeId = createNodeId(`${typePrefix.toLowerCase()}-assets-${item.uid}-${item.locale}`)
    }
    node = getNode(nodeId);
    if (node) {
      deleteNode({
        node: node
      });
    }
  }

  // deleting nodes

  syncData['entry_unpublished'] && syncData['entry_unpublished'].forEach(item => {
    deleteContentstackNodes(item.data, 'entry');
  });

  syncData['asset_unpublished'] && syncData['asset_unpublished'].forEach(item => {
    deleteContentstackNodes(item.data, 'asset');
  });

  syncData['entry_deleted'] && syncData['entry_deleted'].forEach(item => {
    deleteContentstackNodes(item.data, 'entry');
  });

  syncData['asset_deleted'] && syncData['asset_deleted'].forEach(item => {
    deleteContentstackNodes(item.data, 'asset');
  });

  syncData['content_type_deleted'] && syncData['content_type_deleted'].forEach(item => {
    const sameContentTypeNodes = getNodes().filter(
      n => n.internal.type === `${typePrefix}_${item.content_type_uid}`
    );
    sameContentTypeNodes.forEach(node => deleteNode({
      node: node
    }));
  });

  // Updating the syncToken
  const nextSyncToken = contentstackData.sync_token;

  // Storing the sync state for the next sync
  const newState = {};
  newState[`${typePrefix.toLowerCase()}-sync-token-${configOptions.api_key}`] = nextSyncToken;
  setPluginStatus(newState);

  return

};


function buildCustomSchema(array){
  let fields = {}
  array.schema.forEach(field => {
    console.log(field.mandatory, 'mandatory>>>>>>>>')
    switch(field.data_type){
      case 'text':
        if(field.mandatory)
          fields[field.uid] = 'String!';
        else
          fields[field.uid] = 'String';
        break;
      case 'isodate':
        if(field.mandatory)
          fields[field.uid] = 'Date!';
        else
          fields[field.uid] = 'Date';
        break;
      case 'boolean':
        if(field.mandatory)
          fields[field.uid] = 'Boolean!';
        else
          fields[field.uid] = 'Boolean';
        break;
      case 'number':
        if(field.mandatory)
          fields[field.uid] = 'Int!';
        else
          fields[field.uid] = 'Int';
        break;
      case 'link':
        if(field.mandatory) {
          if(field.multiple) {
            console.log(field.uid, 'uid in if man')

            fields[field.uid] = [{
              'title': 'String!',
              'href': 'String!'
            }]
          } else {
            console.log(field.uid, 'uid in else man')
            
            fields[field.uid] = {
              'title': 'String!',
              'href': 'String!'
            }
          }
        } else {
          if(field.multiple) {
            console.log(field.uid, 'uid in if')
            fields[field.uid] = [{
              'title': 'String',
              'href': 'String'
            }]
          } else {
            console.log(field.uid, 'uid in else')
            fields[field.uid] = {
              'title': 'String',
              'href': 'String'
            }
          }
        }
        break;
      case 'group':
      case 'global_field':
        if(field.mandatory){
          fields[field.uid] = `${buildCustomSchema(field)}!`
        } else {
          console.log(field.uid, 'group field>>>>>>>>>>>>>>>>>>>>>>>>')
          fields[field.uid] = buildCustomSchema(field)
        }
        break;
      case 'blocks':
        if(field.mandatory){
          fields[field.uid] = `[${buildCustomSchema(field.blocks)}]!`
        } else {
          fields[field.uid] = buildCustomSchema(field.blocks)
        }
        break;
    }
  })
  console.log(fields, 'returned>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.')
  return fields
}