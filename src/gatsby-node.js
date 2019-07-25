const {
        normalizeEntry, 
        processContentType, 
        processEntry,
        processAsset,
        makeEntryNodeUid,
        makeAssetNodeUid
    } = require("./normalize");

const fetchData = require("./fetch");


exports.sourceNodes = async ({ actions, getNode, getNodes, createNodeId, store, reporter, createContentDigest },configOptions) => {
    const { createNode, deleteNode, touchNode, setPluginStatus } = actions;
    let syncToken; 
    const status = store.getState().status;
    
    if (status && status.plugins && status.plugins[`gatsby-source-contentstack`]) {
        syncToken = status.plugins[`gatsby-source-contentstack`][`contentstack-sync-token-${configOptions.api_key}`]
    }
 
    configOptions.syncToken = syncToken || null;
    
    const { contentstackData } = await fetchData(configOptions, reporter);

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

    syncData['entry_published'] && syncData['entry_published'].forEach(item => {
        let entryNodeId = makeEntryNodeUid(item.data, createNodeId);
        entriesNodeIds.add(entryNodeId);
    });

    syncData['asset_published'] && syncData['asset_published'].forEach(item => {
        let entryNodeId = makeAssetNodeUid(item.data, createNodeId);
        assetsNodeIds.add(entryNodeId);
    });
    
    // adding nodes

    syncData['entry_published'] && syncData['entry_published'].forEach(item => {
        const contentType = contentstackData.contentTypes.find(function(contentType) {
            return item.content_type_uid === contentType.uid;
        });
        const normalizedEntry = normalizeEntry(contentType, item.data,entriesNodeIds, assetsNodeIds, createNodeId);
        const entryNode = processEntry(contentType, normalizedEntry, createNodeId, createContentDigest);
        createNode(entryNode);
    });

    syncData['asset_published'] && syncData['asset_published'].forEach(item => {
        const assetNode = processAsset(item.data, createNodeId, createContentDigest);
        createNode(assetNode);
    });

    contentstackData.contentTypes.forEach(contentType => {
        const contentTypeNode = processContentType(contentType, createNodeId, createContentDigest);
        createNode(contentTypeNode);
    });

    const existingNodes = getNodes().filter(
        n => n.internal.owner === `gatsby-source-contentstack`
    );

    existingNodes.forEach(n => touchNode({ nodeId: n.id }));
    
    function deleteContentstackNodes(item, type) {
        let nodeId = '';
        let node = null;
        if(type === 'entry'){
            nodeId = createNodeId(`contentstack-entry-${item.uid}-${item.locale}`)
        }
        if(type === 'asset'){
            nodeId = createNodeId(`contentstack-assets-${item.uid}-${item.locale}`)
        }
        node = getNode(nodeId);
        if(node){
            deleteNode({ node: node });
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
            n => n.internal.type === `Contentstack_${item.content_type_uid}`
        );
        sameContentTypeNodes.forEach(node =>  deleteNode({ node: node }));
    });

    // Updating the syncToken
    const nextSyncToken = contentstackData.sync_token;

    // Storing the sync state for the next sync
    const newState = {};
    newState[`contentstack-sync-token-${configOptions.api_key}`] = nextSyncToken;
    setPluginStatus(newState);

    return 

};

