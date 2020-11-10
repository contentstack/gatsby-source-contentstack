const {
  normalizeEntry,
  processContentType,
  processEntry,
  processAsset,
  makeEntryNodeUid,
  makeAssetNodeUid,
  buildCustomSchema,
  extendSchemaWithDefaultEntryFields,
  getChildNodes,
  processContentTypeInnerObject,
} = require("./normalize");

const { fetchData, fetchContentTypes } = require("./fetch");

let references = [];
let groups = [];
exports.createSchemaCustomization = async (
  { cache, actions, schema, createNodeId, createContentDigest },
  configOptions
) => {
  let contentTypes;

  const typePrefix = configOptions.type_prefix || "Contentstack";
  try {
    contentTypes = await fetchContentTypes(configOptions);
    await cache.set(typePrefix, contentTypes);
  } catch (error) {
    console.error("Contentstack fetch content type failed!");
  }
  if (configOptions.enableSchemaGeneration) {
    const { createTypes, createNode } = actions;
    contentTypes.forEach((contentType) => {
      const contentTypeUid = contentType.uid.replace(/-/g, "_");
      const name = `${typePrefix}_${contentTypeUid}`;
      const extendedSchema = extendSchemaWithDefaultEntryFields(
        contentType.schema
      );
      let result = buildCustomSchema(
        extendedSchema,
        [],
        [],
        [],
        name,
        typePrefix
      );
      references = references.concat(result.references);
      groups = groups.concat(result.groups);
      const typeDefs = [
        `type linktype{
              title: String
              href: String
            }`,
        schema.buildObjectType({
          name,
          fields: result.fields,
          interfaces: ["Node"],
        }),
      ];
      result.types = result.types.concat(typeDefs);
      createTypes(result.types);
    });

    const contentTypeInterface = `${typePrefix}ContentTypes`;
    createTypes(`
      interface ${contentTypeInterface} @nodeInterface {
        id: ID!
        title: String
        uid: String
      }
    `);

    // Create custom schema for content types
    contentTypes.forEach((contentType) => {
      const contentTypeUid = contentType.uid.replace(/-/g, "_");
      const name = `${typePrefix}ContentTypes${contentTypeUid}`;

      const result = getTypeDefs(
        contentType,
        schema,
        [],
        name,
        createNode,
        createNodeId,
        createContentDigest,
        typePrefix
      );
      createTypes(result);

      const unionTypes = getUnionTypes(contentType.schema, name);
      const unionName = getUnionName(contentType.schema, name);

      const typeDefs = [];

      typeDefs.push(
        schema.buildUnionType({
          name: unionName,
          types: unionTypes,
          resolveType(value) {
            return value.internal.type;
          },
        })
      );

      const fields = {
        title: "String!",
        uid: "String!",
        schema: {
          type: `[${unionName}]`,
          resolve: (source, args, context) => {
            const nodesData = [];
            source.schema___NODE.forEach((id) => {
              context.nodeModel.getAllNodes().find((node) => {
                if (node.id === id) nodesData.push(node);
              });
            });
            return nodesData;
          },
        },
      };

      typeDefs.push(
        schema.buildObjectType({
          name: name,
          fields: fields,
          interfaces: ["Node", contentTypeInterface],
          extensions: {
            // While in SDL you have two different directives, @infer and @dontInfer to
            // control inference behavior, Gatsby Type Builders take a single `infer`
            // extension which accepts a Boolean
            infer: false,
          },
        })
      );
      createTypes(typeDefs);
    });
  }
};

function getTypeDefs(
  contentType,
  gatsbySchema,
  typeDefs,
  name,
  createNode,
  createNodeId,
  createContentDigest,
  typePrefix
) {
  typeDefs = typeDefs || [];

  contentType.schema.forEach((schema) => {
    switch (schema.data_type) {
      case "group":
      case "global_field": {
        const newParent = `${name}_${schema.uid}`;
        getTypeDefs(
          schema,
          gatsbySchema,
          typeDefs,
          newParent,
          createNode,
          createNodeId,
          createContentDigest,
          typePrefix
        );

        // Union types are created appending parent name and field uid
        // separated by "_".
        const unionTypes = getUnionTypes(schema.schema, newParent);
        const unionName = getUnionName(schema.schema, newParent);

        const fields = getObjectFieldsByTypes(schema);
        fields.schema = {
          type: `[${unionName}]`,
          resolve: (source, args, context) => {
            const nodesData = [];
            source.schema___NODE.forEach((id) => {
              context.nodeModel.getAllNodes().find((node) => {
                if (node.id === id) nodesData.push(node);
              });
            });
            return nodesData;
          },
        };

        // After recursive call is over, create union
        // NOTE: object types are created in default block
        typeDefs.push(
          gatsbySchema.buildUnionType({
            name: unionName,
            types: unionTypes,
            resolveType(value) {
              return value.internal.type;
            },
          })
        );

        typeDefs.push(
          gatsbySchema.buildObjectType({
            name: newParent,
            fields: fields,
            interfaces: ["Node"],
            extensions: { infer: false },
          })
        );

        const contentTypeInnerObject = getContentTypeInnerObject(schema);
        contentTypeInnerObject.schema___NODE = getChildNodes(
          schema.schema,
          newParent,
          typePrefix,
          createNodeId
        );
        // Create node
        const nodeData = processContentTypeInnerObject(
          contentTypeInnerObject,
          createNodeId,
          createContentDigest,
          typePrefix,
          newParent
        );
        createNode(nodeData);
        break;
      }
      case "blocks":
        const newParent = `${name}_${schema.uid}`;

        /** BLOCKS **/
        schema.blocks.forEach((block) => {
          const blockType = `${newParent}_${block.uid}`;

          getTypeDefs(
            block,
            gatsbySchema,
            typeDefs,
            blockType,
            createNode,
            createNodeId,
            createContentDigest,
            typePrefix
          );
          const unionTypes = getUnionTypes(block.schema, blockType);
          const unionName = getUnionName(block.schema, blockType);

          const fields = getObjectFieldsByTypes(block);
          fields.schema = {
            type: `[${unionName}]`,
            resolve: (source, args, context) => {
              const nodesData = [];
              source.schema___NODE.forEach((node) => {
                context.nodeModel.getAllNodes().find((id) => {
                  if (node.id === id) nodesData.push(node);
                });
              });
              return nodesData;
            },
          };

          typeDefs.push(
            gatsbySchema.buildUnionType({
              name: unionName,
              types: unionTypes,
              resolveType(value) {
                return value.internal.type;
              },
            })
          );

          typeDefs.push(
            gatsbySchema.buildObjectType({
              name: blockType,
              fields: fields,
              interfaces: ["Node"],
              extensions: { infer: false },
            })
          );

          const contentTypeInnerObject = getContentTypeInnerObject(block);
          contentTypeInnerObject.schema___NODE = getChildNodes(
            block.schema,
            blockType,
            typePrefix,
            createNodeId
          );
          // Create node
          const nodeData = processContentTypeInnerObject(
            contentTypeInnerObject,
            createNodeId,
            createContentDigest,
            typePrefix,
            blockType
          );
          createNode(nodeData);
        });

        const unionTypes = getUnionTypes(schema.blocks, newParent);
        const unionName = getUnionName(schema.blocks, newParent);

        const fields = getObjectFieldsByTypes(schema);
        fields.blocks = {
          type: `[${unionName}]`,
          resolve: (source, args, context) => {
            const nodesData = [];
            source.blocks___NODE.forEach((id) => {
              context.nodeModel.getAllNodes().find((node) => {
                if (node.id === id) nodesData.push(node);
              });
            });
            return nodesData;
          },
        };

        typeDefs.push(
          gatsbySchema.buildUnionType({
            name: unionName,
            types: unionTypes,
            resolveType(value) {
              return value.internal.type;
            },
          })
        );

        typeDefs.push(
          gatsbySchema.buildObjectType({
            name: newParent,
            fields: fields,
            interfaces: ["Node"],
            extensions: { infer: false },
          })
        );

        const contentTypeInnerObject = getContentTypeInnerObject(schema);
        contentTypeInnerObject.blocks___NODE = getChildNodes(
          schema.blocks,
          newParent,
          typePrefix,
          createNodeId
        );

        // Create node
        const nodeData = processContentTypeInnerObject(
          contentTypeInnerObject,
          createNodeId,
          createContentDigest,
          typePrefix,
          newParent
        );
        createNode(nodeData);

        break;
      default: {
        // This will never have schema array in content type
        const type = `${name}_${schema.uid}`;
        const fields = getObjectFieldsByTypes(schema);

        typeDefs.push(
          gatsbySchema.buildObjectType({
            name: type,
            fields: fields,
            interfaces: ["Node"],
            extensions: {
              infer: false,
            },
          })
        );
        const contentTypeInnerObject = getContentTypeInnerObject(schema);
        // Create node
        const nodeData = processContentTypeInnerObject(
          contentTypeInnerObject,
          createNodeId,
          createContentDigest,
          typePrefix,
          type
        );
        createNode(nodeData);
        break;
      }
    }
  });

  return typeDefs;
}

function getContentTypeInnerObject(obj) {
  const newObj = {};
  for (let key in obj) {
    switch (typeof obj[key]) {
      case "boolean":
        newObj[key] = obj[key];
        break;
      case "number":
        newObj[key] = obj[key];
        break;
      case "string":
        newObj[key] = obj[key];
        break;
      // case 'object':
      //   newObj[key] = 'Int';
      //   break;
      default:
        break;
    }
  }
  return newObj;
}

function getObjectFieldsByTypes(obj) {
  const newObj = {};
  for (let key in obj) {
    switch (typeof obj[key]) {
      case "boolean":
        newObj[key] = "Boolean";
        break;
      case "number":
        newObj[key] = "Int";
        break;
      case "string":
        newObj[key] = "String";
        break;
      // case 'object':
      //   newObj[key] = 'Int';
      //   break;
      default:
        break;
    }
  }
  return newObj;
}

function getUnionTypes(schema, parent) {
  let unionTypes = [];
  schema.forEach((field) => {
    let type = `${parent}_${field.uid}`;
    unionTypes.push(type);
  });
  return unionTypes;
}

function getUnionName(schema, parent) {
  let string = parent;
  schema.forEach((field) => {
    string += field.uid;
  });
  string = string + "Union";
  return string;
}

exports.sourceNodes = async (
  {
    cache,
    actions,
    getNode,
    getNodes,
    createNodeId,
    store,
    reporter,
    createContentDigest,
  },
  configOptions
) => {
  const { createNode, deleteNode, touchNode, setPluginStatus } = actions;
  let syncToken;
  const { status } = store.getState();
  // use a custom type prefix if specified
  const typePrefix = configOptions.type_prefix || "Contentstack";

  if (
    status &&
    status.plugins &&
    status.plugins["gatsby-source-contentstack"]
  ) {
    syncToken =
      status.plugins["gatsby-source-contentstack"][
        `${typePrefix.toLowerCase()}-sync-token-${configOptions.api_key}`
      ];
  }

  configOptions.syncToken = syncToken || null;

  const { contentstackData } = await fetchData(configOptions, reporter);
  contentstackData.contentTypes = await cache.get(typePrefix);
  const syncData = contentstackData.syncData.reduce((merged, item) => {
    if (!merged[item.type]) {
      merged[item.type] = [];
    }
    merged[item.type].push(item);
    return merged;
  }, {});

  // for checking if the reference node is present or not
  const entriesNodeIds = new Set();
  const assetsNodeIds = new Set();

  const existingNodes = getNodes().filter(
    (n) => n.internal.owner === "gatsby-source-contentstack"
  );

  existingNodes.forEach((n) => {
    if (
      n.internal.type !== `${typePrefix}ContentTypes` &&
      n.internal.type !== `${typePrefix}_assets`
    ) {
      entriesNodeIds.add(n.id);
    }
    if (n.internal.type === `${typePrefix}_assets`) {
      assetsNodeIds.add(n.id);
    }
    touchNode({
      nodeId: n.id,
    });
  });

  syncData.entry_published &&
    syncData.entry_published.forEach((item) => {
      const entryNodeId = makeEntryNodeUid(item.data, createNodeId, typePrefix);
      entriesNodeIds.add(entryNodeId);
    });

  syncData.asset_published &&
    syncData.asset_published.forEach((item) => {
      const entryNodeId = makeAssetNodeUid(item.data, createNodeId, typePrefix);
      assetsNodeIds.add(entryNodeId);
    });

  // adding nodes
  contentstackData.contentTypes.forEach((contentType) => {
    contentType.uid = contentType.uid.replace(/-/g, "_");
    const contentTypeNode = processContentType(
      contentType,
      createNodeId,
      createContentDigest,
      typePrefix
    );
    createNode(contentTypeNode);
  });

  syncData.entry_published &&
    syncData.entry_published.forEach((item) => {
      item.content_type_uid = item.content_type_uid.replace(/-/g, "_");
      const contentType = contentstackData.contentTypes.find(
        (contentType) => item.content_type_uid === contentType.uid
      );
      const normalizedEntry = normalizeEntry(
        contentType,
        item.data,
        entriesNodeIds,
        assetsNodeIds,
        createNodeId,
        typePrefix
      );
      const entryNode = processEntry(
        contentType,
        normalizedEntry,
        createNodeId,
        createContentDigest,
        typePrefix
      );
      createNode(entryNode);
    });

  syncData.asset_published &&
    syncData.asset_published.forEach((item) => {
      const assetNode = processAsset(
        item.data,
        createNodeId,
        createContentDigest,
        typePrefix
      );
      createNode(assetNode);
    });

  function deleteContentstackNodes(item, type) {
    let nodeId = "";
    let node = null;
    if (type === "entry") {
      nodeId = createNodeId(
        `${typePrefix.toLowerCase()}-entry-${item.uid}-${item.locale}`
      );
    }
    if (type === "asset") {
      nodeId = createNodeId(
        `${typePrefix.toLowerCase()}-assets-${item.uid}-${item.locale}`
      );
    }
    node = getNode(nodeId);
    if (node) {
      deleteNode({
        node,
      });
    }
  }

  // deleting nodes

  syncData.entry_unpublished &&
    syncData.entry_unpublished.forEach((item) => {
      deleteContentstackNodes(item.data, "entry");
    });

  syncData.asset_unpublished &&
    syncData.asset_unpublished.forEach((item) => {
      deleteContentstackNodes(item.data, "asset");
    });

  syncData.entry_deleted &&
    syncData.entry_deleted.forEach((item) => {
      deleteContentstackNodes(item.data, "entry");
    });

  syncData.asset_deleted &&
    syncData.asset_deleted.forEach((item) => {
      deleteContentstackNodes(item.data, "asset");
    });

  syncData.content_type_deleted &&
    syncData.content_type_deleted.forEach((item) => {
      item.content_type_uid = item.content_type_uid.replace(/-/g, "_");
      const sameContentTypeNodes = getNodes().filter(
        (n) => n.internal.type === `${typePrefix}_${item.content_type_uid}`
      );
      sameContentTypeNodes.forEach((node) =>
        deleteNode({
          node,
        })
      );
    });

  // Updating the syncToken
  const nextSyncToken = contentstackData.sync_token;

  // Storing the sync state for the next sync
  const newState = {};
  newState[
    `${typePrefix.toLowerCase()}-sync-token-${configOptions.api_key}`
  ] = nextSyncToken;
  setPluginStatus(newState);
};

exports.createResolvers = ({ createResolvers }) => {
  const resolvers = {};
  references.forEach((reference) => {
    resolvers[reference.parent] = {
      ...resolvers[reference.parent],
      [reference.uid]: {
        resolve(source, args, context, info) {
          if (source[`${reference.uid}___NODE`]) {
            const nodesData = [];
            source[`${reference.uid}___NODE`].forEach((id) => {
              context.nodeModel.getAllNodes().find((node) => {
                if (node.id === id) {
                  nodesData.push(node);
                }
              });
            });
            return nodesData;
          }
          return [];
        },
      },
    };
  });
  groups.forEach((group) => {
    resolvers[group.parent] = {
      ...resolvers[group.parent],
      ...{
        [group.field.uid]: {
          resolve: (source) => {
            if (
              group.field.multiple &&
              !Array.isArray(source[group.field.uid])
            ) {
              return [];
            }
            return source[group.field.uid] || null;
          },
        },
      },
    };
  });
  createResolvers(resolvers);
};
