'use strict';

const { GraphQLInt, GraphQLJSON, GraphQLString } = require('gatsby/graphql');

const { buildCustomSchema, extendSchemaWithDefaultEntryFields } = require('./normalize');
const { fetchContentTypes } = require('./fetch');
const { getContentTypeOption } = require('./utils');
const { resolveGatsbyImageData } = require('./gatsby-plugin-image');

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

  let references = [], groups = [], fileFields = [];

  if (configOptions.enableSchemaGeneration) {
    const { createTypes } = actions;

    /** Type definition for content-type schema */
    const contentTypeSchema = {
      name: `${typePrefix}ContentTypes`,
      fields: {
        title: 'String!', uid: 'String!', created_at: 'Date',
        updated_at: 'Date', schema: 'JSON!', description: 'String',
      },
      interfaces: ['Node'],
      extensions: { infer: false },
    };
    /** Type definition for asset schema */
    const assetTypeSchema = {
      name: `${typePrefix}_assets`,
      fields: {
        url: 'String',
        ...(configOptions.downloadImages ? {
          localAsset: {
            type: 'File',
            extensions: { link: { from: `fields.localAsset` } }
          }
        } : {}),
      },
      interfaces: ['Node'],
      extensions: { infer: true, },
    };

    // Checks if gatsby-plugin-image is installed.
    try {
      const { getGatsbyImageFieldConfig } = await import('gatsby-plugin-image/graphql-utils');
      let fieldConfig = {};
      fieldConfig = getGatsbyImageFieldConfig(async (image, options) => resolveGatsbyImageData({ image, options, cache, reporter }), {
        fit: { type: GraphQLString, },
        crop: { type: GraphQLString, },
        trim: { type: GraphQLString, },
        pad: { type: GraphQLString, },
        quality: { type: GraphQLInt, defaultValue: 50, },
      });
      fieldConfig.type = GraphQLJSON;
      assetTypeSchema.fields.gatsbyImageData = fieldConfig;
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        reporter.info(`Gatsby plugin image is required to use new gatsby image plugin's feature. Please check https://github.com/contentstack/gatsby-source-contentstack#the-new-gatsby-image-plugin for more help.`);
      }
    }

    createTypes([schema.buildObjectType(contentTypeSchema), schema.buildObjectType(assetTypeSchema)]);

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