const {
        normalizeEntry, 
        processContentType, 
        processEntry,
        processAsset,
        makeEntryNodeUid,
        makeAssetNodeUid
    } = require("./normalize");

const fetchData = require("./fetch");


exports.sourceNodes = async ({ actions, getNode, getNodes, createNodeId, store, reporter },configOptions) => {
    const { createNode, deleteNode, touchNode, setPluginStatus } = actions;
    let syncToken 

    if (
        store.getState().status.plugins &&
        store.getState().status.plugins[`gatsby-source-contentstack`] &&
        store.getState().status.plugins[`gatsby-source-contentstack`][
            `contentstack-sync-token-${configOptions.api_key}`
        ]
    ) {
        syncToken = store.getState().status.plugins[`gatsby-source-contentstack`][
            `contentstack-sync-token-${configOptions.api_key}`
        ];
    }

    configOptions.syncToken = syncToken || null;
    
    const { contentstackData } = await fetchData(configOptions);
    
    let publishedEntriesType   = contentstackData.syncData.filter(item => item.type === 'entry_published') || []; 
    let publishedAssetsType    = contentstackData.syncData.filter(item => item.type === 'asset_published') || []; 
    
    // for removing nodes from cache if present
    let unPublishedEntriesType = contentstackData.syncData.filter(item => item.type === 'entry_unpublished') || []; 
    let unPublishedAssetsType  = contentstackData.syncData.filter(item => item.type === 'asset_unpublished') || []; 
    let entriesDeleteType      = contentstackData.syncData.filter(item => item.type === 'entry_deleted') || []; 
    let assetsDeleteType       = contentstackData.syncData.filter(item => item.type === 'asset_deleted') || []; 
    let contentTypeDeleteType  = contentstackData.syncData.filter(item => item.type === 'content_type_deleted') || []; 


    // for checking if the reference node is present or not
    let entriesNodeIds = new Set();
    let assetsNodeIds = new Set();

    publishedEntriesType.forEach(item => {
        let entryNodeId = makeEntryNodeUid(item.data, createNodeId);
        entriesNodeIds.add(entryNodeId);
    });

    publishedAssetsType.forEach(item => {
        let entryNodeId = makeAssetNodeUid(item.data, createNodeId);
        assetsNodeIds.add(entryNodeId);
    });

    publishedEntriesType.forEach(item => {
        const contentType = contentstackData.contentTypes.find(function(contentType) {
            return item.content_type_uid === contentType.uid;
        });
        const normalizedEntry = normalizeEntry(contentType, item.data,entriesNodeIds, assetsNodeIds, createNodeId);
        const entryNode = processEntry(contentType, normalizedEntry, createNodeId);
        createNode(entryNode);
    });

    publishedAssetsType.forEach(item => {
        const assetNode = processAsset(item.data, createNodeId);
        createNode(assetNode);
    });

    contentstackData.contentTypes.forEach(contentType => {
        const contentTypeNode = processContentType(contentType, createNodeId);
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

    unPublishedEntriesType.forEach(item => {
        deleteContentstackNodes(item.data, 'entry');
    });

    unPublishedAssetsType.forEach(item => {
        console.log("item.data",item.data);
        deleteContentstackNodes(item.data, 'asset');
    });

    entriesDeleteType.forEach(item => {
        deleteContentstackNodes(item.data, 'entry');
    });

    assetsDeleteType.forEach(item => {
        deleteContentstackNodes(item.data, 'asset');
    });

    contentTypeDeleteType.forEach(item => {
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

