
exports.processContentType = (content_type, createNodeId, createContentDigest) => {
    const nodeId = createNodeId(`contentstack-contentType-${content_type.uid}`);
    const nodeContent = JSON.stringify(content_type);
    const nodeData = Object.assign({}, content_type, {
        id: nodeId,
        parent: null,
        children: [],
        internal: {
            type: `ContentstackContentTypes`,
            content: nodeContent,
            contentDigest: createContentDigest(nodeContent),
        },
    });
    return nodeData;
}

exports.processAsset = (asset, createNodeId, createContentDigest) => {
    const nodeId = makeAssetNodeUid(asset, createNodeId);
    const nodeContent = JSON.stringify(asset);
    const nodeData = Object.assign({}, asset, {
        id: nodeId,
        parent: null,
        children: [],
        internal: {
            type: `Contentstack_assets`,
            content: nodeContent,
            contentDigest: createContentDigest(nodeContent),
        },
    });
    return nodeData;
}

exports.processEntry = (content_type, entry, createNodeId, createContentDigest) => {
    const nodeId = makeEntryNodeUid(entry, createNodeId);
    const nodeContent = JSON.stringify(entry);
    const nodeData = Object.assign({}, entry, {
        id: nodeId,
        parent: null,
        children: [],
        internal: {
            type: `Contentstack_${content_type.uid}`,
            content: nodeContent,
            contentDigest: createContentDigest(nodeContent),
        },
    });
    return nodeData;
}

exports.normalizeEntry = (contentType, entry, entriesNodeIds, assetsNodeIds, createNodeId) => {
    let resolveEntry = Object.assign({}, entry, builtEntry(contentType.schema, entry, entry.publish_details.locale, entriesNodeIds, assetsNodeIds, createNodeId));
    return resolveEntry;
}


const makeAssetNodeUid = exports.makeAssetNodeUid = (asset, createNodeId) => {
    let publishedLocale = asset.publish_details.locale;
    return createNodeId(`contentstack-assets-${asset.uid}-${publishedLocale}`);
};

const makeEntryNodeUid = exports.makeEntryNodeUid = (entry, createNodeId) => {
    let publishedLocale = entry.publish_details.locale;
    return createNodeId(`contentstack-entry-${entry.uid}-${publishedLocale}`);
};

const normalizeGroup = (field, value, locale, entriesNodeIds, assetsNodeIds, createNodeId) => {
    let groupObj = null;
    if(field.multiple && value instanceof Array){
        groupObj = [];
        value.forEach(groupValue => {
            groupObj.push(builtEntry(field.schema, groupValue, locale, entriesNodeIds, assetsNodeIds, createNodeId));
        })
    } else {
        groupObj = {};
        groupObj = builtEntry(field.schema, value, locale, entriesNodeIds, assetsNodeIds, createNodeId);
    }
    return groupObj;
};

const normalizeModularBlock = (blocks, value, locale, entriesNodeIds, assetsNodeIds, createNodeId) => {
    let modularBlocksObj = [];
    if(value){
        value.map(block => {
            Object.keys(block).forEach(key => {
                let blockSchema = blocks.filter(block => block.uid ===  key);
                if (!blockSchema.length) {
                    // block value no longer exists block schema so ignore it
                    return
                }
                let blockObj = {};
                blockObj[key] =  builtEntry(blockSchema[0].schema, block[key], locale, entriesNodeIds, assetsNodeIds, createNodeId);
                modularBlocksObj.push(blockObj);
            });
        });
    }
    return modularBlocksObj;
};

const normalizeReferenceField = (value, locale, entriesNodeIds, createNodeId) => {
    let reference = [];
    value.forEach(entry => {
        if(typeof entry === "object" && entry.uid){
            if(entriesNodeIds.has(createNodeId(`contentstack-entry-${entry.uid}-${locale}`))){
                reference.push(createNodeId(`contentstack-entry-${entry.uid}-${locale}`));    
            }
        } else {
            if(entriesNodeIds.has(createNodeId(`contentstack-entry-${entry}-${locale}`))){
                reference.push(createNodeId(`contentstack-entry-${entry}-${locale}`));    
            } 
        }
    });
    return reference;
}

const normalizeFileField = (value, locale, assetsNodeIds, createNodeId) => {
    let reference = {};
    if(Array.isArray(value)){
        reference = [];
        value.forEach(assetUid => {
            if(assetsNodeIds.has(createNodeId(`contentstack-assets-${assetUid}-${locale}`))){
                reference.push(createNodeId(`contentstack-assets-${assetUid}-${locale}`));    
            }
        });
    } else{
        if(assetsNodeIds.has(createNodeId(`contentstack-assets-${value}-${locale}`))){
            reference = createNodeId(`contentstack-assets-${value}-${locale}`);
        }
    }
    return reference;
}

const getSchemaValue = (obj, key) => {
    if (obj === null) return null;
    if (typeof obj !== "object") return null;
    return obj.hasOwnProperty(key.uid) ? obj[key.uid] : null;
};


const builtEntry = (schema, entry, locale, entriesNodeIds, assetsNodeIds, createNodeId) => {
    let entryObj = {};
    schema.forEach(field => {
        const value = getSchemaValue(entry, field);
        switch (field.data_type) {
            case "reference":
                entryObj[`${field.uid}___NODE`] = value && normalizeReferenceField(value, locale, entriesNodeIds, createNodeId);
                break;
            case "file":
                entryObj[`${field.uid}___NODE`] = value && normalizeFileField(value, locale, assetsNodeIds, createNodeId);
            break;    
            case "group":
            case "global_field":    
                entryObj[field.uid] = normalizeGroup(field, value, locale, entriesNodeIds, assetsNodeIds, createNodeId);
            break;
            case "blocks":
                entryObj[field.uid] = normalizeModularBlock(field.blocks, value, locale, entriesNodeIds, assetsNodeIds, createNodeId);
            break;
            default: 
            entryObj[field.uid] = value;
        }

    });
    return entryObj;
}

