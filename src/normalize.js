exports.processContentType = (content_type, createNodeId, createContentDigest, typePrefix) => {
  const nodeId = createNodeId(`${typePrefix.toLowerCase()}-contentType-${content_type.uid}`);
  const nodeContent = JSON.stringify(content_type);
  const nodeData = Object.assign({}, content_type, {
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: `${typePrefix}ContentTypes`,
      content: nodeContent,
      contentDigest: createContentDigest(nodeContent),
    },
  });
  return nodeData;
}

exports.processAsset = (asset, createNodeId, createContentDigest, typePrefix) => {
  const nodeId = makeAssetNodeUid(asset, createNodeId, typePrefix);
  const nodeContent = JSON.stringify(asset);
  const nodeData = Object.assign({}, asset, {
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: `${typePrefix}_assets`,
      content: nodeContent,
      contentDigest: createContentDigest(nodeContent),
    },
  });
  return nodeData;
}

exports.processEntry = (content_type, entry, createNodeId, createContentDigest, typePrefix) => {
  const nodeId = makeEntryNodeUid(entry, createNodeId, typePrefix);
  const nodeContent = JSON.stringify(entry);
  const nodeData = Object.assign({}, entry, {
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: `${typePrefix}_${content_type.uid}`,
      content: nodeContent,
      contentDigest: createContentDigest(nodeContent),
    },
  });
  return nodeData;
}

exports.normalizeEntry = (contentType, entry, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix) => {
  let resolveEntry = Object.assign({}, entry, builtEntry(contentType.schema, entry, entry.publish_details.locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix));
  return resolveEntry;
}


const makeAssetNodeUid = exports.makeAssetNodeUid = (asset, createNodeId, typePrefix) => {
  let publishedLocale = asset.publish_details.locale;
  return createNodeId(`${typePrefix.toLowerCase()}-assets-${asset.uid}-${publishedLocale}`);
};

const makeEntryNodeUid = exports.makeEntryNodeUid = (entry, createNodeId, typePrefix) => {
  let publishedLocale = entry.publish_details.locale;
  return createNodeId(`${typePrefix.toLowerCase()}-entry-${entry.uid}-${publishedLocale}`);
};

const normalizeGroup = (field, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix) => {
  let groupObj = null;
  if (field.multiple && value instanceof Array) {
    groupObj = [];
    value.forEach(groupValue => {
      groupObj.push(builtEntry(field.schema, groupValue, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix));
    })
  } else {
    groupObj = {};
    groupObj = builtEntry(field.schema, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix);
  }
  return groupObj;
};

const normalizeModularBlock = (blocks, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix) => {
  let modularBlocksObj = [];
  if (value) {
    value.map(block => {
      Object.keys(block).forEach(key => {
        let blockSchema = blocks.filter(block => block.uid === key);
        if (!blockSchema.length) {
          // block value no longer exists block schema so ignore it
          return
        }
        let blockObj = {};
        blockObj[key] = builtEntry(blockSchema[0].schema, block[key], locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix);
        modularBlocksObj.push(blockObj);
      });
    });
  }
  return modularBlocksObj;
};

const normalizeReferenceField = (value, locale, entriesNodeIds, createNodeId, typePrefix) => {
  let reference = [];
  if (value && !Array.isArray(value)) return;
  value.forEach(entry => {
    if (typeof entry === "object" && entry.uid) {
      if (entriesNodeIds.has(createNodeId(`${typePrefix.toLowerCase()}-entry-${entry.uid}-${locale}`))) {
        reference.push(createNodeId(`${typePrefix.toLowerCase()}-entry-${entry.uid}-${locale}`));
      }
    } else {
      if (entriesNodeIds.has(createNodeId(`${typePrefix.toLowerCase()}-entry-${entry}-${locale}`))) {
        reference.push(createNodeId(`${typePrefix.toLowerCase()}-entry-${entry}-${locale}`));
      }
    }
  });
  return reference;

}

const normalizeFileField = (value, locale, assetsNodeIds, createNodeId, typePrefix) => {
  let reference = {};
  if (Array.isArray(value)) {
    reference = [];
    value.forEach(assetUid => {
      if (assetsNodeIds.has(createNodeId(`${typePrefix.toLowerCase()}-assets-${assetUid}-${locale}`))) {
        reference.push(createNodeId(`${typePrefix.toLowerCase()}-assets-${assetUid}-${locale}`));
      }
    });
  } else {
    if (assetsNodeIds.has(createNodeId(`${typePrefix.toLowerCase()}-assets-${value}-${locale}`))) {
      reference = createNodeId(`${typePrefix.toLowerCase()}-assets-${value}-${locale}`);
    }
  }
  return reference;
}

const getSchemaValue = (obj, key) => {
  if (obj === null) return null;
  if (typeof obj !== "object") return null;
  return obj.hasOwnProperty(key.uid) ? obj[key.uid] : null;
};


const builtEntry = (schema, entry, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix) => {
  let entryObj = {};
  schema.forEach(field => {
    const value = getSchemaValue(entry, field);
    switch (field.data_type) {
      case "reference":
        entryObj[`${field.uid}___NODE`] = value && normalizeReferenceField(value, locale, entriesNodeIds, createNodeId, typePrefix);
        break;
      case "file":
        entryObj[`${field.uid}___NODE`] = value && normalizeFileField(value, locale, assetsNodeIds, createNodeId, typePrefix);
        break;
      case "group":
      case "global_field":
        entryObj[field.uid] = normalizeGroup(field, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix);
        break;
      case "blocks":
        entryObj[field.uid] = normalizeModularBlock(field.blocks, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix);
        break;
      default:
        entryObj[field.uid] = value;
    }

  });
  return entryObj;
}

// let types = []
const buildCustomSchema = exports.buildCustomSchema = (schema, types, parent, prefix) => {
  let fields = {}
  let references = {}
  types = types ? types : []
  schema.forEach(field => {
    switch (field.data_type) {
      case 'text':
        if (field.mandatory)
          fields[field.uid] = 'String!';
        else
          fields[field.uid] = 'String';
        break;
      case 'isodate':
        if (field.mandatory)
          fields[field.uid] = 'Date!';
        else
          fields[field.uid] = 'Date';
        break;
      case 'boolean':
        if (field.mandatory)
          fields[field.uid] = 'Boolean!';
        else
          fields[field.uid] = 'Boolean';
        break;
      case 'number':
        if (field.mandatory)
          fields[field.uid] = 'Int!';
        else
          fields[field.uid] = 'Int';
        break;
      case 'link':
        if (field.mandatory) {
          if (field.multiple) {
            fields[field.uid] = `[linktype]`
          } else {
            fields[field.uid] = `linktype`
          }
        } else {
          if (field.multiple) {
            fields[field.uid] = `[linktype]`
          } else {
            fields[field.uid] = `linktype`
          }
        }
        break;
      case 'group':
      case 'global_field':
        if (field.mandatory) {
          let newparent = parent.concat('_', field.uid)
          let {
            fields
          } = buildCustomSchema(field.schema, types, newparent)
          if (Object.keys(fields).length > 0) {
            let type = `type ${newparent} ${JSON.stringify(fields).replace(/"/g, '')}`
            types.push(type);
            fields[field.uid] = `${newparent}!`
          }
        } else {
          let newparent = parent.concat('_', field.uid)
          let {
            fields
          } = buildCustomSchema(field.schema, types, newparent)
          if (Object.keys(fields).length > 0) {
            let type = `type ${newparent} ${JSON.stringify(fields).replace(/"/g, '')}`
            types.push(type);
            fields[field.uid] = `${newparent}`
          }
        }
        break;
      case 'blocks':
        parent = parent.concat('_', field.uid)
        if (field.mandatory) {
          let blockType = buildBlockCustomSchema(field.blocks, types, parent)
          types.push(blockType)
          fields[field.uid] = `[${parent}]!`
        } else {
          let blockType = buildBlockCustomSchema(field.blocks, types, parent)
          types.push(blockType)
          fields[field.uid] = `[${parent}]`
        }
        break;
      case 'reference':
        let unionType = `union `
        if (typeof field.reference_to === 'string') {
          let type = `type ${prefix}_${field.uid} { title: String!}`
          types.push(type)
          fields[field.uid] = `${type}`
        } else {
          let unions = []
          field.reference_to.forEach(reference => {
            let referenceType = `${prefix}_${reference}`
            unionType = unionType.concat(referenceType)
            unions.push(referenceType)
            let type = `type ${referenceType} { title: String!}`
            types.push(type)
          })
          let name = ''
          name = name.concat(unions.join(''), `_Union`)
          unionType = unionType.concat(`_Union = `, unions.join(' | '))
          types.push(unionType)

          references = {
            name,
            unions,
          }
          fields[field.uid] = `[${name}]`
        }
        break;
    }
  })
  return {
    fields,
    types,
    references
  }
}

const buildBlockCustomSchema = (blocks, types, parent) => {
  let blockFields = {}
  let blockType = `type ${parent} {`
  blocks.forEach(block => {
    let newparent = parent.concat(block.uid)
    blockType = blockType.concat(`${block.uid} : ${newparent} `)
    let {
      fields
    } = buildCustomSchema(block.schema, types, newparent)
    if (Object.keys(fields).length > 0) {
      let type = `type ${newparent} ${JSON.stringify(fields).replace(/"/g, '')}`
      types.push(type)
      blockFields[block.uid] = `${newparent}`
    }
  })
  blockType = blockType.concat('}')
  return blockType
}