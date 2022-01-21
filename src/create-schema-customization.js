'use strict';

const { buildCustomSchema, extendSchemaWithDefaultEntryFields } = require('./normalize');
const { fetchContentTypes } = require('./fetch');
const { getContentTypeOption } = require('./utils');
const { getGatsbyImageData } = require('./image-data');

exports.createSchemaCustomization = async ({ cache, actions, schema, reporter }, configOptions) => {
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

  // Checks if gatsby-plugin-image is installed.
  let isGatsbyPluginImageInstalled = false;
  try {
    await import('gatsby-plugin-image');
    isGatsbyPluginImageInstalled = true;
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      reporter.info(`Gatsby plugin image is required to use new gatsby image plugin's feature. Please check https://github.com/contentstack/gatsby-source-contentstack#the-new-gatsby-image-plugin for more help.`);
    }
  }

  let references = [], groups = [], fileFields = [];

  if (configOptions.enableSchemaGeneration) {
    const { createTypes } = actions;
    /**CREATE TYPE DEFINITION FOR CONTENTTYPE OBJECT */
    createTypes([
      schema.buildObjectType({
        name: `${typePrefix}ContentTypes`,
        fields: {
          title: 'String!', uid: 'String!', created_at: 'Date',
          updated_at: 'Date', schema: 'JSON!', description: 'String',
        },
        interfaces: ['Node'],
        extensions: { infer: false },
      }),
      schema.buildObjectType({
        name: `${typePrefix}_assets`,
        fields: {
          url: 'String',
          ...(isGatsbyPluginImageInstalled ? {
            gatsbyImageData: getGatsbyImageData({ cache, reporter }),
          } : {}),
          ...(configOptions.downloadImages ? {
            localAsset: {
              type: 'File',
              extensions: { link: { from: `fields.localAsset` } }
            }
          } : {}),
        },
        interfaces: ['Node'],
        extensions: { infer: true, },
      }),
    ]);

    contentTypes && contentTypes.forEach(contentType => {
      const contentTypeUid = contentType.uid.replace(/-/g, '_');
      const name = `${typePrefix}_${contentTypeUid}`;
      const extendedSchema = extendSchemaWithDefaultEntryFields(contentType.schema);
      let result = buildCustomSchema(extendedSchema, [], [], [], [], name, typePrefix, disableMandatoryFields);
      references = references.concat(result.references);
      groups = groups.concat(result.groups);
      fileFields = fileFields.concat(result.fileFields);
      const typeDefs = [`type linktype { title: String href: String }`,
        schema.buildObjectType({
          name,
          fields: result.fields,
          interfaces: ['Node'],
          extensions: { infer: true }
        }),
      ];
      result.types = result.types.concat(typeDefs);
      createTypes(result.types);
    });

    await Promise.all([
      await cache.set(`${typePrefix}_${configOptions.api_key}_references`, references),
      await cache.set(`${typePrefix}_${configOptions.api_key}_groups`, groups),
      await cache.set(`${typePrefix}_${configOptions.api_key}_file_fields`, fileFields),
    ]);
  }
};