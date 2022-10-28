'use strict';

const { getJSONToHtmlRequired } = require('./utils');

exports.processContentType = (contentType, createNodeId, createContentDigest, typePrefix) => {
  const nodeId = createNodeId(`${typePrefix.toLowerCase()}-contentType-${contentType.uid}`);
  const type = `${typePrefix}ContentTypes`;

  const nodeContent = JSON.stringify(contentType);
  const nodeData = {
    ...contentType,
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: type,
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

exports.normalizeEntry = (contentType, entry, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix, configOptions) => {
  const resolveEntry = {
    ...entry,
    ...builtEntry(contentType.schema, entry, entry?.publish_details?.locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix, configOptions),
  };
  return resolveEntry;
};

const makeAssetNodeUid = (exports.makeAssetNodeUid = (asset, createNodeId, typePrefix) => {
  const publishedLocale = asset?.publish_details?.locale;
  return createNodeId(`${typePrefix.toLowerCase()}-assets-${asset.uid}-${publishedLocale}`);
});

const makeEntryNodeUid = (exports.makeEntryNodeUid = (entry, createNodeId, typePrefix) => {
  const publishedLocale = entry?.publish_details?.locale;
  return createNodeId(`${typePrefix.toLowerCase()}-entry-${entry.uid}-${publishedLocale}`);
});

const normalizeGroup = (field, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix, configOptions) => {
  let groupObj = null;
  if (field.multiple) {
    groupObj = [];
    if (value instanceof Array) {
      value.forEach(groupValue => {
        groupObj.push(builtEntry(field.schema, groupValue, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix, configOptions));
      });
    } else {
      // In some cases value is null, this makes graphql treat all the objects as null
      // So need to pass a valid array instance.
      // This also helps to handle when a user changes a group to multiple after initially
      // setting a group to single.. the server passes an object and the previous condition
      // again makes groupObj null
      groupObj.push(builtEntry(field.schema, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix, configOptions));
    }
  } else {
    groupObj = {};
    groupObj = builtEntry(field.schema, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix, configOptions);
  }
  return groupObj;
};

const normalizeModularBlock = (blocks, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix, configOptions) => {
  const modularBlocksObj = [];
  if (value) {
    value.map(block => {
      Object.keys(block).forEach(key => {
        const blockSchema = blocks.filter(block => block.uid === key);
        if (!blockSchema.length) {
          // block value no longer exists block schema so ignore it
          return;
        }
        const blockObj = {};
        blockObj[key] = builtEntry(blockSchema[0].schema, block[key], locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix, configOptions);
        modularBlocksObj.push(blockObj);
      });
    });
  }
  return modularBlocksObj;
};

const normalizeReferenceField = (value, locale, entriesNodeIds, createNodeId, typePrefix) => {
  const reference = [];
  if (value && !Array.isArray(value)) return;
  value.forEach(entry => {
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
    value.forEach(assetUid => {
      const nodeId = createNodeId(`${typePrefix.toLowerCase()}-assets-${assetUid}-${locale}`);
      if (assetsNodeIds.has(nodeId)) {
        reference.push(nodeId);
      }
    });
  } else if (assetsNodeIds.has(createNodeId(`${typePrefix.toLowerCase()}-assets-${value}-${locale}`))) {
    reference = createNodeId(`${typePrefix.toLowerCase()}-assets-${value}-${locale}`);
  } else {
    // when the asset is not published
    reference = null;
  }
  return reference;
};

const getSchemaValue = (obj, key) => {
  if (obj === null) return null;
  if (typeof obj !== 'object') return null;
  return Object.prototype.hasOwnProperty.call(obj, key.uid)
    ? obj[key.uid]
    : null;
};

const builtEntry = (schema, entry, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix, configOptions) => {
  const entryObj = {};
  schema.forEach(field => {
    let value = getSchemaValue(entry, field);
    switch (field.data_type) {
      case 'reference':
        entryObj[`${field.uid}___NODE`] = value && normalizeReferenceField(value, locale, entriesNodeIds, createNodeId, typePrefix);
        break;
      case 'file':
        if (!value) value = null;
        entryObj[`${field.uid}___NODE`] = value && normalizeFileField(value, locale, assetsNodeIds, createNodeId, typePrefix);
        break;
      case 'group':
      case 'global_field':
        entryObj[field.uid] = normalizeGroup(field, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix, configOptions);
        break;
      case 'blocks':
        entryObj[field.uid] = normalizeModularBlock(field.blocks, value, locale, entriesNodeIds, assetsNodeIds, createNodeId, typePrefix, configOptions);
        break;
      case 'json':
        entryObj[field.uid] = value;
        break;
      default:
        entryObj[field.uid] = value;
    }
  });
  return entryObj;
};

const buildBlockCustomSchema = (blocks, types, references, groups, fileFields, jsonRteFields, parent, prefix, disableMandatoryFields, jsonRteToHtml, createNodeId, interfaceParent) => {
  const blockFields = {};
  let blockType = interfaceParent ? `type ${parent} implements ${interfaceParent} @infer {` : `type ${parent} @infer {`;
  let blockInterface = interfaceParent && `interface ${interfaceParent} {`;

  blocks.forEach(block => {
    const newparent = parent.concat(block.uid);
    // If this block has a reference_to, it is a global field and should have a new interface
    const newInterfaceParent = block.reference_to ? `${prefix}_${block.reference_to}` : interfaceParent && interfaceParent.concat(block.uid);

    blockType = blockType.concat(`${block.uid} : ${newparent} `);
    blockInterface = blockInterface && blockInterface.concat(`${block.uid} : ${newInterfaceParent} `);

    const { fields } = buildCustomSchema(block.schema, types, references, groups, fileFields, jsonRteFields, newparent, prefix, disableMandatoryFields, jsonRteToHtml, createNodeId, newInterfaceParent);

    const typeFields = {};
    const interfaceFields = {};
    for (const key in fields) {
      typeFields[key] = fields[key].type || fields[key];
      interfaceFields[key] = typeFields[key].replace(newparent, newInterfaceParent);
    }

    if (Object.keys(fields).length > 0) {
      if (newInterfaceParent) {
        const interfaceType = `interface ${newInterfaceParent} ${JSON.stringify(interfaceFields).replace(/"/g, '')}`;
        const type = `type ${newparent} implements ${newInterfaceParent} @infer ${JSON.stringify(typeFields).replace(/"/g, '')}`;
        types.push(interfaceType, type);
      } else {
        const type = `type ${newparent} @infer ${JSON.stringify(typeFields).replace(/"/g, '')}`;
        types.push(type);
      }
      blockFields[block.uid] = `${newparent}`;
    }
  });

  blockType = blockType.concat('}');
  blockInterface = blockInterface && blockInterface.concat('}');

  return blockInterface ? [blockInterface, blockType] : [blockType];
};

exports.extendSchemaWithDefaultEntryFields = schema => {
  schema.push({
    data_type: 'text',
    uid: 'uid',
    multiple: false,
    mandatory: false,
  });
  schema.push({
    data_type: 'text',
    uid: 'locale',
    multiple: false,
    mandatory: false,
  });
  schema.push({
    data_type: 'group',
    uid: 'publish_details',
    schema: [
      {
        data_type: 'text',
        uid: 'locale',
        multiple: false,
        mandatory: false,
      },
    ],
    multiple: false,
    mandatory: false,
  });
  schema.push({
    data_type: 'isodate',
    uid: 'updated_at',
    multiple: false,
    mandatory: false,
  });
  schema.push({
    data_type: 'string',
    uid: 'updated_by',
    multiple: false,
    mandatory: false,
  });
  schema.push({
    data_type: 'isodate',
    uid: 'created_at',
    multiple: false,
    mandatory: false,
  });
  schema.push({
    data_type: 'string',
    uid: 'created_by',
    multiple: false,
    mandatory: false,
  });
  return schema;
};

const buildCustomSchema = (exports.buildCustomSchema = (schema, types, references, groups,
  fileFields, jsonRteFields, parent, prefix, disableMandatoryFields, jsonRteToHtml, createNodeId, interfaceParent) => {
  const fields = {};
  groups = groups || [];
  references = references || [];
  fileFields = fileFields || [];
  types = types || [];
  jsonRteFields = jsonRteFields || [];
  schema.forEach(field => {
    switch (field.data_type) {
      case 'text':
        fields[field.uid] = {
          resolve: source => source[field.uid] || null,
        };
        if (field.mandatory && !disableMandatoryFields) {
          if (field.multiple) {
            fields[field.uid].type = '[String]!';
          } else {
            fields[field.uid].type = 'String!';
          }
        } else if (field.multiple) {
          fields[field.uid].type = '[String]';
        } else {
          fields[field.uid].type = 'String';
        }
        break;
      case 'isodate':
        if (field.mandatory && !disableMandatoryFields) {
          if (field.multiple) {
            fields[field.uid] = { type: '[Date]!' };
          } else {
            fields[field.uid] = { type: 'Date!' };
          }
        } else if (field.multiple) {
          fields[field.uid] = { type: '[Date]' };
        } else {
          fields[field.uid] = { type: 'Date' };
        }
        fields[field.uid].extensions = { dateformat: {} };
        break;
      case 'boolean':
        if (field.mandatory && !disableMandatoryFields) {
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
        fields[field.uid] = {
          resolve: source => source[field.uid] || null,
        };
        if (field.mandatory && !disableMandatoryFields) {
          if (field.multiple) {
            fields[field.uid].type = '[Float]!';
          } else {
            fields[field.uid].type = 'Float!';
          }
        } else if (field.multiple) {
          fields[field.uid].type = '[Float]';
        } else {
          fields[field.uid].type = 'Float';
        }
        break;
      // This is to support custom field types nested inside groups, global_fields & modular_blocks
      case 'json':
        if (getJSONToHtmlRequired(jsonRteToHtml, field)) {
          jsonRteFields.push({ parent, field });
          if (field.mandatory && !disableMandatoryFields) {
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
        } else {
          fields[field.uid] = {
            resolve: function resolve(source) {
              return source[field.uid] || null;
            }
          }
          if (field.mandatory && !disableMandatoryFields) {
            if (field.multiple) {
              fields[field.uid].type = '[JSON]!';
            } else {
              fields[field.uid].type = 'JSON!';
            }
          } else if (field.multiple) {
            fields[field.uid].type = '[JSON]';
          } else {
            fields[field.uid].type = 'JSON';
          }
        }

        break;
      case 'link':
        if (field.mandatory && !disableMandatoryFields) {
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
        fileFields.push({ parent, field });

        if (field.mandatory && !disableMandatoryFields) {
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
        const newParent = parent.concat('_', field.uid);
        // If this is a global field, generate a new top-level interface for it
        const newInterfaceParent = field.data_type === 'global_field'
          ? `${prefix}_${field.reference_to}`
          : interfaceParent && interfaceParent.concat('_', field.uid);

        const result = buildCustomSchema(field.schema, types, references, groups, fileFields, jsonRteFields, newParent, prefix, disableMandatoryFields, jsonRteToHtml, createNodeId, newInterfaceParent);

        const typeFields = {};
        const interfaceFields = {};
        for (const key in result.fields) {
          typeFields[key] = result.fields[key].type || result.fields[key];
          interfaceFields[key] = typeFields[key].replace(newParent, newInterfaceParent);
        }

        if (Object.keys(typeFields).length > 0) {
          if (newInterfaceParent) {
            const interfaceType = `interface ${newInterfaceParent} ${JSON.stringify(interfaceFields).replace(/"/g, '')}`;
            const type = `type ${newParent} implements ${newInterfaceParent} @infer ${JSON.stringify(typeFields).replace(/"/g, '')}`;
            types.push(interfaceType, type);
          } else {
            const type = `type ${newParent} @infer ${JSON.stringify(typeFields).replace(/"/g, '')}`;
            types.push(type);
          }

          groups.push({ parent, field });

          if (field.mandatory && !disableMandatoryFields) {
            if (field.multiple) {
              fields[field.uid] = `[${newParent}]!`;
            } else {
              fields[field.uid] = `${newParent}!`;
            }
          } else if (field.multiple) {
            fields[field.uid] = `[${newParent}]`;
          } else {
            fields[field.uid] = `${newParent}`;
          }
        }

        break;
      case 'blocks':
        const blockParent = parent.concat('_', field.uid);
        const blockInterfaceParent = interfaceParent && interfaceParent.concat('_', field.uid);

        const blockTypes = buildBlockCustomSchema(field.blocks, types, references, groups, fileFields, jsonRteFields, blockParent, prefix, disableMandatoryFields, jsonRteToHtml, createNodeId, blockInterfaceParent);
        types.push(...blockTypes);

        if (field.mandatory && !disableMandatoryFields) {
          if (field.multiple) {
            fields[field.uid] = `[${blockParent}]!`;
          } else {
            fields[field.uid] = `${blockParent}!`;
          }
        } else if (field.multiple) {
          fields[field.uid] = `[${blockParent}]`;
        } else {
          fields[field.uid] = `${blockParent}`;
        }

        break;
      case 'reference':
        let unionType = 'union ';
        if (typeof field.reference_to === 'string' || field.reference_to.length === 1) {
          field.reference_to = Array.isArray(field.reference_to) ? field.reference_to[0] : field.reference_to;
          const type = `type ${prefix}_${field.reference_to} implements Node @infer { title: String${disableMandatoryFields ? '' : '!'} }`;
          types.push(type);

          references.push({ parent, uid: field.uid });

          if (field.mandatory && !disableMandatoryFields) {
            fields[field.uid] = `[${prefix}_${field.reference_to}]!`;
          } else {
            fields[field.uid] = `[${prefix}_${field.reference_to}]`;
          }
        } else {
          const unions = [];
          field.reference_to.forEach(reference => {
            const referenceType = `${prefix}_${reference}`;
            unionType = unionType.concat(referenceType);
            unions.push(referenceType);
            const type = `type ${referenceType} implements Node @infer { title: String${disableMandatoryFields ? '' : '!'} }`;
            types.push(type);
          });
          let name = '';
          name = name.concat(unions.join(''), '_Union');
          unionType = unionType.concat('_Union = ', unions.join(' | '));
          types.push(unionType);

          references.push({ parent, uid: field.uid });

          if (field.mandatory && !disableMandatoryFields) {
            fields[field.uid] = `[${name}]!`;
          } else {
            fields[field.uid] = `[${name}]`;
          }
        }
        break;
    }
  });
  return { fields, types, references, groups, fileFields, jsonRteFields };
});
