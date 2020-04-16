exports.processContentType = (contentType, createNodeId, createContentDigest, typePrefix) => {
  const nodeId = createNodeId(`${typePrefix.toLowerCase()}-contentType-${contentType.uid}`);
  const nodeContent = JSON.stringify(contentType);
  const nodeData = {
    ...contentType,
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: `${typePrefix}ContentTypes`,
      content: nodeContent,
      contentDigest: createContentDigest(nodeContent),
    },
  };
  return nodeData;
};

exports.processAsset = (asset, createNodeId, createContentDigest, typePrefix) => {
  const nodeId = makeAssetNodeUid(asset, createNodeId, typePrefix);
  const nodeContent = JSON.stringify(asset);
  const nodeData = {
    ...asset,
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: `${typePrefix}_assets`,
      content: nodeContent,
      contentDigest: createContentDigest(nodeContent),
    },
  };
  return nodeData;
};

exports.processEntry = (contentType, entry, createNodeId, createContentDigest, typePrefix) => {
  const nodeId = makeEntryNodeUid(entry, createNodeId, typePrefix);
  const nodeContent = JSON.stringify(entry);
  const nodeData = {
    ...entry,
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: `${typePrefix}_${contentType.uid}`,
      content: nodeContent,
      contentDigest: createContentDigest(nodeContent),
    },
  };
  return nodeData;
};

exports.normalizeEntry = (contentType, entry, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix) => {
  const resolveEntry = { ...entry, ...builtEntry(contentType.schema, entry, entry.publish_details.locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix) };
  return resolveEntry;
};

const makeAssetNodeUid = exports.makeAssetNodeUid = (asset, createNodeId, typePrefix) => {
  const publishedLocale = asset.publish_details.locale;
  return createNodeId(`${typePrefix.toLowerCase()}-assets-${asset.uid}-${publishedLocale}`);
};

const makeEntryNodeUid = exports.makeEntryNodeUid = (entry, createNodeId, typePrefix) => {
  const publishedLocale = entry.publish_details.locale;
  return createNodeId(`${typePrefix.toLowerCase()}-entry-${entry.uid}-${publishedLocale}`);
};

const normalizeGroup = (field, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix) => {
  let groupObj = null;
  if (field.multiple && value instanceof Array) {
    groupObj = [];
    value.forEach((groupValue) => {
      groupObj.push(builtEntry(field.schema, groupValue, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix));
    });
  } else {
    groupObj = {};
    groupObj = builtEntry(field.schema, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix);
  }
  return groupObj;
};

const normalizeModularBlock = (blocks, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix) => {
  const modularBlocksObj = [];
  if (value) {
    value.map((block) => {
      Object.keys(block).forEach((key) => {
        const blockSchema = blocks.filter((block) => block.uid === key);
        if (!blockSchema.length) {
          // block value no longer exists block schema so ignore it
          return;
        }
        const blockObj = {};
        blockObj[key] = builtEntry(blockSchema[0].schema, block[key], locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix);
        modularBlocksObj.push(blockObj);
      });
    });
  }
  return modularBlocksObj;
};

const normalizeReferenceField = (value, locale, entriesNodeIds, createNodeId, typePrefix) => {
  const reference = [];
  if (value && !Array.isArray(value)) return;
  value.forEach((entry) => {
    if (typeof entry === 'object' && entry.uid) {
      if (entriesNodeIds.has(createNodeId(`${typePrefix.toLowerCase()}-entry-${entry.uid}-${locale}`))) {
        reference.push(createNodeId(`${typePrefix.toLowerCase()}-entry-${entry.uid}-${locale}`));
      }
    } else if (entriesNodeIds.has(createNodeId(`${typePrefix.toLowerCase()}-entry-${entry}-${locale}`))) {
      reference.push(createNodeId(`${typePrefix.toLowerCase()}-entry-${entry}-${locale}`));
    }
  });
  return reference;
};

const normalizeFileField = (value, locale, assetsNodeIds, createNodeId, typePrefix) => {
  let reference = {};
  if (Array.isArray(value)) {
    reference = [];
    value.forEach((assetUid) => {
      if (assetsNodeIds.has(createNodeId(`${typePrefix.toLowerCase()}-assets-${assetUid}-${locale}`))) {
        reference.push(createNodeId(`${typePrefix.toLowerCase()}-assets-${assetUid}-${locale}`));
      }
    });
  } else if (assetsNodeIds.has(createNodeId(`${typePrefix.toLowerCase()}-assets-${value}-${locale}`))) {
    reference = createNodeId(`${typePrefix.toLowerCase()}-assets-${value}-${locale}`);
  }
  return reference;
};

const getSchemaValue = (obj, key) => {
  if (obj === null) return null;
  if (typeof obj !== 'object') return null;
  return Object.prototype.hasOwnProperty.call(obj, key.uid) ? obj[key.uid] : null;
};

const builtEntry = (schema, entry, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix) => {
  const entryObj = {};
  schema.forEach((field) => {
    const value = getSchemaValue(entry, field);
    switch (field.data_type) {
      case 'reference':
        entryObj[`${field.uid}___NODE`] = value && normalizeReferenceField(value, locale, entriesNodeIds, createNodeId, typePrefix);
        break;
      case 'file':
        entryObj[`${field.uid}___NODE`] = value && normalizeFileField(value, locale, assetsNodeIds, createNodeId, typePrefix);
        break;
      case 'group':
      case 'global_field':
        entryObj[field.uid] = normalizeGroup(field, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix);
        break;
      case 'blocks':
        entryObj[field.uid] = normalizeModularBlock(field.blocks, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix);
        break;
      default:
        entryObj[field.uid] = value;
    }
  });
  return entryObj;
};

const buildBlockCustomSchema = (blocks, types, parent) => {
  const blockFields = {};
  let blockType = `type ${parent} {`;
  blocks.forEach((block) => {
    const newparent = parent.concat(block.uid);
    blockType = blockType.concat(`${block.uid} : ${newparent} `);
    const {
      fields,
    } = buildCustomSchema(block.schema, types, newparent);
    if (Object.keys(fields).length > 0) {
      const type = `type ${newparent} ${JSON.stringify(fields).replace(/"/g, '')}`;
      types.push(type);
      blockFields[block.uid] = `${newparent}`;
    }
  });
  blockType = blockType.concat('}');
  return blockType;
};

const buildCustomSchema = exports.buildCustomSchema = (schema, types, parent, prefix) => {
  const fields = {};
  let references = {};
  types = types || [];
  schema.forEach((field) => {
    switch (field.data_type) {
      case 'text':
        if (field.mandatory) {
          if (field.multiple) {
            fields[field.uid] = '[String]!';
          } else {
            fields[field.uid] = 'String!';
          }
        } else if (field.multiple) {
          fields[field.uid] = '[String]';
        } else {
          fields[field.uid] = 'String';
        }
        break;
      case 'isodate':
        if (field.mandatory) {
          if (field.multiple) {
            fields[field.uid] = '[Date]!';
          } else {
            fields[field.uid] = 'Date!';
          }
        } else if (field.multiple) {
          fields[field.uid] = '[Date]';
        } else {
          fields[field.uid] = 'Date';
        }
        break;
      case 'boolean':
        if (field.mandatory) {
          if (field.multiple) {
            fields[field.uid] = '[Boolean]!';
          } else {
            fields[field.uid] = 'Boolean!';
          }
        } else if (field.multiple) {
          fields[field.uid] = '[Boolean]';
        } else {
          fields[field.uid] = 'Boolean';
        }
        break;
      case 'number':
        if (field.mandatory) {
          if (field.multiple) {
            fields[field.uid] = '[Int]!';
          } else {
            fields[field.uid] = 'Int!';
          }
        } else if (field.multiple) {
          fields[field.uid] = '[Int]';
        } else {
          fields[field.uid] = 'Int';
        }
        break;
      case 'link':
        if (field.mandatory) {
          if (field.multiple) {
            fields[field.uid] = '[linktype]!';
          } else {
            fields[field.uid] = 'linktype!';
          }
        } else if (field.multiple) {
          fields[field.uid] = '[linktype]';
        } else {
          fields[field.uid] = 'linktype';
        }
        break;
      case 'file':
        const type = `type ${prefix}_assets implements Node { url: String }`;
        types.push(type);
        if (field.mandatory) {
          if (field.multiple) {
            fields[field.uid] = `[${prefix}_assets]!`;
          } else {
            fields[field.uid] = `${prefix}_assets!`;
          }
        } else if (field.multiple) {
          fields[field.uid] = `[${prefix}_assets]`;
        } else {
          fields[field.uid] = `${prefix}_assets`;
        }
        break;
      case 'group':
      case 'global_field':
        if (field.mandatory) {
          const newparent = parent.concat('_', field.uid);
          const {
            fields,
          } = buildCustomSchema(field.schema, types, newparent);
          if (Object.keys(fields).length > 0) {
            const type = `type ${newparent} ${JSON.stringify(fields).replace(/"/g, '')}`;
            types.push(type);
            if (field.multiple) {
              fields[field.uid] = `[${newparent}]!`;
            } else {
              fields[field.uid] = `${newparent}!`;
            }
          }
        } else {
          const newparent = parent.concat('_', field.uid);
          const {
            fields,
          } = buildCustomSchema(field.schema, types, newparent);
          if (Object.keys(fields).length > 0) {
            const type = `type ${newparent} ${JSON.stringify(fields).replace(/"/g, '')}`;
            types.push(type);
            if (field.multiple) {
              fields[field.uid] = `[${newparent}]`;
            } else {
              fields[field.uid] = `${newparent}`;
            }
          }
        }
        break;
      case 'blocks':
        parent = parent.concat('_', field.uid);
        if (field.mandatory) {
          const blockType = buildBlockCustomSchema(field.blocks, types, parent);
          types.push(blockType);
          if (field.multiple) {
            fields[field.uid] = `[${parent}]!`;
          } else {
            fields[field.uid] = `${parent}!`;
          }
        } else {
          const blockType = buildBlockCustomSchema(field.blocks, types, parent);
          types.push(blockType);
          if (field.multiple) {
            fields[field.uid] = `[${parent}]`;
          } else {
            fields[field.uid] = `${parent}`;
          }
        }
        break;
      case 'reference':
        let unionType = 'union ';
        if (typeof field.reference_to === 'string') {
          const type = `type ${prefix}_${field.uid} { title: String!}`;
          types.push(type);
          if (field.mandatory) {
            if (field.multiple) {
              fields[field.uid] = `[${type}]!`;
            } else {
              fields[field.uid] = `${type}!`;
            }
          } else if (field.multiple) {
            fields[field.uid] = `[${type}]`;
          } else {
            fields[field.uid] = `${type}`;
          }
        } else {
          const unions = [];
          field.reference_to.forEach((reference) => {
            const referenceType = `${prefix}_${reference}`;
            unionType = unionType.concat(referenceType);
            unions.push(referenceType);
            const type = `type ${referenceType} { title: String!}`;
            types.push(type);
          });
          let name = '';
          name = name.concat(unions.join(''), '_Union');
          unionType = unionType.concat('_Union = ', unions.join(' | '));
          types.push(unionType);

          references = {
            name,
            unions,
          };
          if (field.mandatory) {
            fields[field.uid] = `[${name}]!`;
          } else {
            fields[field.uid] = `${name}`;
          }
        }
        break;
    }
  });
  return {
    fields,
    types,
    references,
  };
};
