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
    let name = `${typePrefix}_${contentType.uid}`
    console.log(name, 'type>>')
    let res = buildCustomSchema(contentType, name);
    console.log(res.types, '@@@@@@@@@@@@@@@@@@@')
    let typeDefs= [
      `type linktype{
      title: String
      href: String
      }`,
    
      schema.buildObjectType({
        name,
        fields: res.fields,
        interfaces: ["Node"],
      }),
    ]
    if(res.references){
      res.references.forEach(reference=>{
        typeDefs.concat(reference)
      })
    }
    res.types = res.types.concat(typeDefs)
    createTypes(res.types)
  });
  
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

let types = []
function buildCustomSchema(array, parent){
  let fields = {}
  let references = []
  // console.log(array.schema, 'aaray >>>>>>>>>>>>')
  array.schema.forEach(field => {
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
            fields[field.uid] = `[linktype]`
          } else {
            fields[field.uid] = `linktype`
          }
        } else {
          if(field.multiple) {
            fields[field.uid] = `[linktype]`
          } else {
            fields[field.uid] = `linktype`
          }
        }
        break;
      case 'group':
      case 'global_field':
        if(field.mandatory){
          parent = parent.concat('_',field.uid)
          let groupFields = buildCustomSchema(field, parent).fields
          if(Object.keys(groupFields).length > 0 ) {
          let type = `type ${parent} ${JSON.stringify(groupFields).replace(/"/g, '')}`
          types.push(type);
          fields[field.uid] = `${parent}!`
          }
        } else {
          parent = parent.concat('_',field.uid)
          let groupFields = buildCustomSchema(field, parent).fields
          if(Object.keys(groupFields).length > 0 ) {
          let type = `type ${parent} ${JSON.stringify(groupFields).replace(/"/g, '')}`
          types.push(type);
          fields[field.uid] = `${parent}`
          }
        }
        break;
      case 'blocks':
        parent = parent.concat('_', field.uid)
        // if(field.mandatory){
          let {blockType, blockFields} = buildBlockCustomSchema(field.blocks, parent)
          console.log('blockFields>>>>>>>>>>>>>>>>>>', field.uid, JSON.stringify(blockFields, null, 2))
          types.push(blockType)
          fields[field.uid] = `${parent}`

       // } else {
         // fields[field.uid] = buildBlockCustomSchema(field.blocks, types, parent)
        // }
        break;
      // case 'reference':

        // references.push(`schema.buildUnionType({
        //   name: "abtesting_contact_usUnion",
        //   types: ['Contentstack_abtesting', 'Contentstack_contact_us' ],
        // })`)
        // fields[field] = 'Contentstack_abtestingContentstack_contact_usUnion'
        // let unionType = `union `
        // if(typeof field.reference_to === 'string'){
        //   let type = `type cs_${field.uid} { title: String!}`
        //   // types.push(type)
        // } else {
          // field.reference_to.forEach(reference => {
          //   // unionType = unionType.concat(reference)
          //   let type = `type Contentstack_${reference} { title: String!}`
          //   types.push(type)
          // })
          // let unionType = `union Contentstack_abtesting_Contentstack_contact_usUnion = Contentstack_abtesting | Contentstack_contact_us`
          // types.push(unionType)
        // }
       // fields[field] = { 
         // type: "[Contentstack_abtestingContentstack_contact_usUnion]", 
          // resolve(parent, args, context, info) {
          //   let field = parent[field]
          //   return context.nodeModel.getNodesByIds({
          //     ids: `${parent[field]}___NODE`,
          //   });
          // }
        // }
        // console.log(field.reference_to ,'reference_to>>>>>>>>>>>>>>>')
        // if(field.mandatory) {
        //   fields[field] = `[${unionType}]!`
        // } else {
        //   fields[field] = `[${unionType}]`
        // }
      // break;
    }
  })
  // console.log(types, array.uid, 'returned>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.')
  return {fields, types, references}
}

function buildBlockCustomSchema(blocks, parent){
  let blockFields = {}
  let blockType = `type ${parent} {`
  blocks.forEach(block => { 
    let newparent = parent.concat(block.uid)
    blockType = blockType.concat(`${block.uid} : ${newparent} `)
    let { fields } = buildCustomSchema(block, newparent)

    // console.log(parent, 'inside')
      if(Object.keys(fields).length > 0) {
      let type = `type ${newparent} ${JSON.stringify(fields).replace(/"/g, '')}`
      types.push(type)
      // console.log(type, 'fields>>>>>>>@@@@@@@@@@@@@@@@@@@@@')
      blockFields[block.uid] = `${newparent}`
    }
  })
  blockType = blockType.concat('}')
  // console.log(blockType, 'blocktype')
  return {blockType, blockFields}
}