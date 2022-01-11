'use strict';
/** NPM dependencies */
const fetch = require('node-fetch');

const { normalizeEntry, sanitizeEntry, processContentType, processEntry, processAsset,
  makeEntryNodeUid, makeAssetNodeUid, buildCustomSchema, extendSchemaWithDefaultEntryFields,
} = require('./normalize');
const { checkIfUnsupportedFormat, SUPPORTED_FILES_COUNT, IMAGE_REGEXP, CODES, getContentTypeOption }=require('./utils');
const { fetchData, fetchContentTypes } = require('./fetch');
const downloadAssets = require('./download-assets');
const { setFieldsOnGraphQLNodeType } = require('./extend-node-type');

let references = [];
let groups = [];
let fileFields = [];

exports.onPreBootstrap = ({ reporter }) => {
  const args = process.argv;
  if (args.includes('--verbose')) {
    reporter.setVerbose(true);
  }
};

exports.createSchemaCustomization = async ({ cache, actions, schema }, configOptions) => {
  let contentTypes;

  const typePrefix = configOptions.type_prefix || 'Contentstack';
  const disableMandatoryFields = configOptions.disableMandatoryFields || false;
  try {
    const contentTypeOption = getContentTypeOption(configOptions);
    contentTypes = await fetchContentTypes(configOptions, contentTypeOption);
    // Caching content-types because we need to be able to support multiple stacks.
    await cache.set(typePrefix, contentTypes);
  } catch (error) {
    console.error('Contentstack fetch content type failed!');
  }
  if (configOptions.enableSchemaGeneration) {
    const { createTypes } = actions;
    contentTypes.forEach(contentType => {
      const contentTypeUid = contentType.uid.replace(/-/g, '_');
      const name = `${typePrefix}_${contentTypeUid}`;
      const extendedSchema = extendSchemaWithDefaultEntryFields(contentType.schema);
      let result = buildCustomSchema(extendedSchema, [], [], [], [], name, typePrefix, disableMandatoryFields);
      references = references.concat(result.references);
      groups = groups.concat(result.groups);
      fileFields = fileFields.concat(result.fileFields);
      const typeDefs = [
        `type linktype{
              title: String
              href: String
            }`,
        schema.buildObjectType({
          name,
          fields: result.fields,
          interfaces: ['Node'],
          extensions: {infer: true}
        }),
      ];
      result.types = result.types.concat(typeDefs);
      createTypes(result.types);
    });

    /**CREATE TYPE DEFINITION FOR CONTENTTYPE OBJECT */
    const name = `${typePrefix}ContentTypes`;
    const fields = {
      title: 'String!',
      uid: 'String!',
      created_at: 'Date',
      updated_at: 'Date',
      schema: 'JSON!',
      description: 'String',
    };
    createTypes([
      schema.buildObjectType({
        name,
        fields,
        interfaces: ['Node'],
        extensions: { infer: false },
      }),
    ]);
  }
};

exports.sourceNodes = async ({ cache, actions, getNode, getNodes, createNodeId, reporter, createContentDigest, getNodesByType, getCache }, configOptions) => {
  const { createNode, deleteNode, touchNode } = actions;
  // use a custom type prefix if specified
  const typePrefix = configOptions.type_prefix || 'Contentstack';

  let contentstackData;
  try {
    const contentTypeOption = getContentTypeOption(configOptions);
    const { contentstackData: _contentstackData } = await fetchData(configOptions, reporter, cache, contentTypeOption);
    contentstackData = _contentstackData;
    contentstackData.contentTypes = await cache.get(typePrefix);
  } catch (error) {
    reporter.panic({
      id: CODES.SyncError,
      context: {
        sourceMessage: `Error occurred while fetching contentstack in [sourceNodes]. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help.`
      },
      error
    });
    throw error;
  }
  
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

  const existingNodes = getNodes().filter(n => n.internal.owner === 'gatsby-source-contentstack');

  existingNodes.forEach(n => {
    if (n.internal.type !== `${typePrefix}ContentTypes` && n.internal.type !== `${typePrefix}_assets`) {
      entriesNodeIds.add(n.id);
    }
    if (n.internal.type === `${typePrefix}_assets`) {
      assetsNodeIds.add(n.id);
    }

    touchNode(n);
    if (n.localAsset___NODE) {
      // Prevent GraphQL type inference from crashing on this property
      // touchNode({ nodeId: n.localAsset___NODE });
      touchNode({ ...n, nodeId: n.localAsset___NODE });
    }
  });

  syncData.entry_published &&
    syncData.entry_published.forEach(item => {
      const entryNodeId = makeEntryNodeUid(item.data, createNodeId, typePrefix);
      entriesNodeIds.add(entryNodeId);
    });

  let countOfSupportedFormatFiles = 0;
  syncData.asset_published && syncData.asset_published.forEach(function (item) {
    /**
     * Get the count of assets (images), filtering out svg and gif format,
     * as these formats are not supported by gatsby-image.
     * We need the right count to render in progress bar,
     * which will show progress for downloading remote files.
     */
    if (configOptions.downloadImages) {
      // Filter the images from the assets
      const regexp = IMAGE_REGEXP;
      let matches;
      let isUnsupportedExt;
      try {
        matches = regexp.exec(item.data.url);
        isUnsupportedExt = checkIfUnsupportedFormat(item.data.url);

        if (matches && !isUnsupportedExt)
          countOfSupportedFormatFiles++;

      } catch (error) {
        reporter.panic('Something went wrong. Details: ', error);
      }
    }
    var entryNodeId = makeAssetNodeUid(item.data, createNodeId, typePrefix);
    assetsNodeIds.add(entryNodeId);
  });
  // Cache the found count
 configOptions.downloadImages && await cache.set(SUPPORTED_FILES_COUNT, countOfSupportedFormatFiles);

  // adding nodes
  contentstackData.contentTypes.forEach(contentType => {
    contentType.uid = contentType.uid.replace(/-/g, '_');
    const contentTypeNode = processContentType(
      contentType,
      createNodeId,
      createContentDigest,
      typePrefix
    );
    createNode(contentTypeNode);
  });

  syncData.entry_published &&
    syncData.entry_published.forEach(item => {
      item.content_type_uid = item.content_type_uid.replace(/-/g, '_');
      const contentType = contentstackData.contentTypes.find(
        contentType => item.content_type_uid === contentType.uid
      );
      const normalizedEntry = normalizeEntry(
        contentType,
        item.data,
        entriesNodeIds,
        assetsNodeIds,
        createNodeId,
        typePrefix
      );
      const sanitizedEntry = sanitizeEntry(contentType.schema, normalizedEntry);
      const entryNode = processEntry(
        contentType,
        sanitizedEntry,
        createNodeId,
        createContentDigest,
        typePrefix
      );
      createNode(entryNode);
    });

  syncData.asset_published &&
    syncData.asset_published.forEach(item => {
      const assetNode = processAsset(
        item.data,
        createNodeId,
        createContentDigest,
        typePrefix
      );
      createNode(assetNode);
    });

  if (configOptions.downloadImages) {
    try {
      await downloadAssets({ cache, getCache, createNode, createNodeId, getNodesByType, reporter }, typePrefix, configOptions);
    } catch (error) {
      reporter.info('Something went wrong while downloading assets. Details: ' + error);
    }
  }

  function deleteContentstackNodes(item, type) {
    let nodeId = '';
    let node = null;
    if (type === 'entry') {
      nodeId = createNodeId(
        `${typePrefix.toLowerCase()}-entry-${item.uid}-${item.locale}`
      );
    }
    if (type === 'asset') {
      nodeId = createNodeId(
        `${typePrefix.toLowerCase()}-assets-${item.uid}-${item.locale}`
      );
    }
    node = getNode(nodeId);
    if (node) {
      deleteNode(node);
    }
  }

  // deleting nodes
  syncData.entry_unpublished && syncData.entry_unpublished.forEach(item => deleteContentstackNodes(item.data, 'entry'));

  syncData.asset_unpublished && syncData.asset_unpublished.forEach(item => deleteContentstackNodes(item.data, 'asset'));

  syncData.entry_deleted && syncData.entry_deleted.forEach(item => deleteContentstackNodes(item.data, 'entry'));

  syncData.asset_deleted && syncData.asset_deleted.forEach(item => deleteContentstackNodes(item.data, 'asset'));

  syncData.content_type_deleted &&
    syncData.content_type_deleted.forEach(item => {
      item.content_type_uid = item.content_type_uid.replace(/-/g, '_');
      const sameContentTypeNodes = getNodes().filter(
        n => n.internal.type === `${typePrefix}_${item.content_type_uid}`
      );
      sameContentTypeNodes.forEach(node => deleteNode(node));
    });
};

exports.setFieldsOnGraphQLNodeType = setFieldsOnGraphQLNodeType;

exports.createResolvers = ({ createResolvers }) => {
  const resolvers = {};
  fileFields.forEach(fileField => {
    resolvers[fileField.parent] = {
      ...resolvers[fileField.parent],
      ... {      
      [fileField.field.uid]: {
        resolve(source, args, context, info) {
          if (fileField.field.multiple && source[`${fileField.field.uid}___NODE`]) {
              const nodesData = [];
              
              source[`${fileField.field.uid}___NODE`].forEach(id => {
                const existingNode = context.nodeModel.getNodeById({ id })
                
                if (existingNode) {
                  nodesData.push(existingNode);
                }
              });

              return nodesData;
            } else { 
              const id = source[`${fileField.field.uid}___NODE`]
              return context.nodeModel.getNodeById({ id })
            }
        },
      },
    }
    };
  })
  references.forEach(reference => {
    resolvers[reference.parent] = {
      ...resolvers[reference.parent],
      [reference.uid]: {
        resolve(source, args, context, info) {
          if (source[`${reference.uid}___NODE`]) {
            const nodesData = [];

            source[`${reference.uid}___NODE`].forEach(id => {
              const existingNode = context.nodeModel.getNodeById({
                id 
              })
              
              if (existingNode) {
                nodesData.push(existingNode);
              }
            });

            return nodesData;
          }
          return [];
        },
      },
    };
  });
  groups.forEach(group => {
    resolvers[group.parent] = {
      ...resolvers[group.parent],
      ...{
        [group.field.uid]: {
          resolve: source => {
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

exports.pluginOptionsSchema = ({ Joi }) => {
  return Joi.object({
    api_key: Joi.string().required().description(`API Key is a unique key assigned to each stack.`),
    delivery_token: Joi.string().required().description(`Delivery Token is a read-only credential.`),
    environment: Joi.string().required().description(`Environment where you published your data.`),
    cdn: Joi.string().default(`https://cdn.contentstack.io/v3`).description(`CDN set this to point to other cdn end point. For eg: https://eu-cdn.contentstack.com/v3 `),
    type_prefix:  Joi.string().default(`Contentstack`).description(`Specify a different prefix for types. This is useful in cases where you have multiple instances of the plugin to be connected to different stacks.`),
    expediteBuild: Joi.boolean().default(false).description(`expediteBuild set this to either true or false.`),
    enableSchemaGeneration: Joi.boolean().default(false).description(`Specify true if you want to generate custom schema.`),
    disableMandatoryFields: Joi.boolean().default(false).description(`Specify true if you want to generate optional graphql fields for mandatory Contentstack fields`),
    downloadImages: Joi.boolean().default(false).description(`Specify true if you want to download all your contentstack images locally`),
    contentTypes: Joi.array().items(Joi.string().required()).description(`Specify list of content-types to be fetched from contentstack`),
    excludeContentTypes: Joi.array().items(Joi.string().required()).description(`Specify list of content-types to be excluded while fetching data from contentstack`),
    locales: Joi.array().items(Joi.string().required()).description(`Specify list of locales to be fetched from contentstack`),
  }).external(validateContentstackAccess)
}

const ERROR_MAP = {
  [CODES.SyncError]: {
    text: context => context.sourceMessage,
    level: `ERROR`,
    type: `PLUGIN`
  },
  [CODES.APIError]: {
    text: context => context.sourceMessage,
    level: `ERROR`,
    type: `PLUGIN`
  },
  [CODES.ImageAPIError]: {
    text: context => context.sourceMessage,
    level: `ERROR`,
    type: `PLUGIN`
  },
  [CODES.MissingDependencyError]: {
    text: context => context.sourceMessage,
    level: `ERROR`,
    type: `PLUGIN`,
  },
};

let coreSupportsOnPluginInit;

try {
  const { isGatsbyNodeLifecycleSupported } = require('gatsby-plugin-utils');
  if (isGatsbyNodeLifecycleSupported('onPluginInit')) {
    coreSupportsOnPluginInit = 'stable';
  } else if (isGatsbyNodeLifecycleSupported('unstable_onPluginInit')) {
    coreSupportsOnPluginInit = 'unstable';
  }
} catch (error) {
  console.error('Could not check if Gatsby supports onPluginInit lifecycle');
}

exports.onPreInit = ({ reporter }) => {
  if (!coreSupportsOnPluginInit && reporter.setErrorMap) {
    reporter.setErrorMap(ERROR_MAP);
  }
};

// need to conditionally export otherwise it throws error for older versions
if (coreSupportsOnPluginInit === 'stable') {
  exports.onPluginInit = ({ reporter }) => {
    reporter.setErrorMap(ERROR_MAP);
  };
} else if (coreSupportsOnPluginInit === 'unstable') {
  exports.unstable_onPluginInit = ({ reporter }) => {
    reporter.setErrorMap(ERROR_MAP);
  };
}

const validateContentstackAccess = async pluginOptions => {
  if (process.env.NODE_ENV === `test`) return undefined
  
  let host = pluginOptions.cdn ? pluginOptions.cdn : 'https://cdn.contentstack.io/v3';
  await fetch(`${host}/content_types?include_count=false`, {
    headers: {
      "api_key" : `${pluginOptions.api_key}`,
      "access_token": `${pluginOptions.delivery_token}`,
    },
  })
    .then(res => res.ok)
    .then(ok => {
      if (!ok)
        throw new Error(
          `Cannot access Contentstack with api_key=${pluginOptions.api_key} & delivery_token=${pluginOptions.delivery_token}.`
        )
    })

  return undefined
}