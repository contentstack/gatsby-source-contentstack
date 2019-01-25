const _ = require("lodash");
const crypto = require("crypto");
const { map, reduce, parallel } = require("asyncro");


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

exports.normalizeEntry = (contentType, entry, entries, createNodeId) => {
    let resolveEntry = Object.assign({}, entry, builtEntry(contentType.schema, entry, entry.locale, entries, createNodeId));
    return resolveEntry;
}


const makeEntryNodeUid = (entry, createNodeId) => {
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


const normalizeGroup = (field, value, locale, entries, createNodeId) => {
    let groupObj = null;
    if(field.multiple && value instanceof Array){
        groupObj = [];
        value.forEach(groupValue => {
            groupObj.push(builtEntry(field.schema, groupValue, locale, entries, createNodeId));
        })
    } else {
        groupObj = {};
        groupObj = builtEntry(field.schema, value, locale, entries, createNodeId);
    }
    return groupObj;
};

const normalizeModularBlock = (blocks, value, locale, entries, createNodeId) => {
    let modularBlocksObj = [];
    value.map(block => {
        Object.keys(block).forEach(key => {
            let blockSchema = blocks.filter(block => block.uid ===  key);
            let blockObj = {};
            blockObj[key] =  builtEntry(blockSchema[0] && blockSchema[0].schema, block[key], locale, entries, createNodeId);
            modularBlocksObj.push(blockObj);
        });
    });
    return modularBlocksObj;
};

const normalizeReferenceField = (value, referenceTo, locale, entries,  createNodeId) => {
    let reference = [];
    value.forEach(entryUid => {
            let nonLocalizedEntries = _.filter(entries, function(entry) { return entry.uid === entryUid }) || [];
                nonLocalizedEntries.forEach(entry => {
                    let publishedLocale = null;
                    if(entry && entry.publish_details){
                        if (Array.isArray(entry.publish_details)) { 
                            publishedLocale = entry.publish_details[0].locale;
                        } else {
                            publishedLocale = entry.publish_details.locale;
                        }
                    }
                    if(publishedLocale === locale){
                        reference.push(createNodeId(`contentstack-entry-${entryUid}-${publishedLocale}`));
                    }
                });
         
    });
    return reference;
}


const builtEntry = (schema, entry, locale, entries, createNodeId) => {
    let entryObj = {};
    if (schema) {
        schema.forEach(field => {
            let value = (typeof entry[field.uid] != 'undefined') ? entry[field.uid] : null;
            switch (field.data_type) {
                case "reference":
                    entryObj[`${field.uid}___NODE`] = value && normalizeReferenceField(value, field.reference_to, locale, entries[field.reference_to], createNodeId);
                break;
                case "group":
                    entryObj[field.uid] = normalizeGroup(field, value, locale, entries, createNodeId);
                break;
                case "blocks":
                    entryObj[field.uid] = normalizeModularBlock(field.blocks, value, locale, entries, createNodeId);
                break;
                default: 
                entryObj[field.uid] = value;
            }

        });
    }
    return entryObj;
}

