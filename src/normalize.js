const _ = require("lodash");
const crypto = require("crypto");


exports.processContentType = (content_type, createNodeId) => {
    const nodeId = createNodeId(`contentstack-contentType-${content_type.uid}`);
    const nodeContent = JSON.stringify(content_type);
    const nodeContentDigest = crypto
    .createHash('md5')
    .update(nodeContent)
    .digest('hex');
    const nodeData = Object.assign({}, content_type, {
        id: nodeId,
        parent: null,
        children: [],
        internal: {
            type: `ContentstackContentTypes`,
            content: nodeContent,
            contentDigest: nodeContentDigest,
        },
    });
    return nodeData;
}

exports.processAsset = (asset, createNodeId) => {
    const nodeId = makeAssetNodeUid(asset, createNodeId);
    const nodeContent = JSON.stringify(asset);
    const nodeContentDigest = crypto
        .createHash('md5')
        .update(nodeContent)
        .digest('hex');
    const nodeData = Object.assign({}, asset, {
        id: nodeId,
        parent: null,
        children: [],
        internal: {
            type: `Contentstack_assets`,
            content: nodeContent,
            contentDigest: nodeContentDigest,
        },
    });
    return nodeData;
}

exports.processEntry = (content_type, entry, createNodeId) => {
    const nodeId = makeEntryNodeUid(entry, createNodeId);
    const nodeContent = JSON.stringify(entry);
    const nodeContentDigest = crypto
        .createHash('md5')
        .update(nodeContent)
        .digest('hex');
    const nodeData = Object.assign({}, entry, {
        id: nodeId,
        parent: null,
        children: [],
        internal: {
            type: `Contentstack_${content_type.uid}`,
            content: nodeContent,
            contentDigest: nodeContentDigest,
        },
    });
    return nodeData;
}

exports.normalizeEntry = (contentType, entry, entriesNodeIds, assetsNodeIds, createNodeId) => {
    let resolveEntry = Object.assign({}, entry, builtEntry(contentType.schema, entry, entry.locale, entriesNodeIds, assetsNodeIds, createNodeId));
    return resolveEntry;
}


const makeAssetNodeUid = exports.makeAssetNodeUid = (asset, createNodeId) => {
    let publishedLocale = null;
    if(asset && asset.publish_details){
        if (Array.isArray(asset.publish_details)) { 
            publishedLocale = asset.publish_details[0].locale;
        } else {
            publishedLocale = asset.publish_details.locale;
        }
    }
    return createNodeId(`contentstack-assets-${asset.uid}-${publishedLocale}`);
};

const makeEntryNodeUid = exports.makeEntryNodeUid = (entry, createNodeId) => {
    let publishedLocale = null;
    if(entry && entry.publish_details){
        if (Array.isArray(entry.publish_details)) { 
            publishedLocale = entry.publish_details[0].locale;
        } else {
            publishedLocale = entry.publish_details.locale;
        }
    }
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
    value.map(block => {
        Object.keys(block).forEach(key => {
            let blockSchema = blocks.filter(block => block.uid ===  key);
            let blockObj = {};
            blockObj[key] =  builtEntry(blockSchema[0].schema, block[key], locale, entriesNodeIds, assetsNodeIds, createNodeId);
            modularBlocksObj.push(blockObj);
        });
    });
    return modularBlocksObj;
};

const normalizeReferenceField = (value, locale, entriesNodeIds, createNodeId) => {
    let reference = [];
    value.forEach(entryUid => {
        if(entriesNodeIds.has(createNodeId(`contentstack-entry-${entryUid}-${locale}`))){
            reference.push(createNodeId(`contentstack-entry-${entryUid}-${locale}`));    
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

