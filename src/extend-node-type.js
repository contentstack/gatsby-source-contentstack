'use strict';

const { GraphQLInt, GraphQLJSON, GraphQLString } = require('gatsby/graphql');

const { resolveGatsbyImageData } = require('./gatsby-plugin-image');
const { CODES } = require('./utils');

exports.setFieldsOnGraphQLNodeType = async ({ type, cache, reporter }, configOptions) => {
  const typePrefix = configOptions.type_prefix || 'Contentstack';
  if (type.name !== `${typePrefix}_assets`) {
    return {};
  }

  // gatsby-plugin-image
  const getGatsbyImageData = async () => {
    try {
      const { getGatsbyImageFieldConfig } = await import('gatsby-plugin-image/graphql-utils');

      const fieldConfig = getGatsbyImageFieldConfig(
        async (image, options) => resolveGatsbyImageData({ image, options, cache, reporter }),
        {
          fit: {
            type: GraphQLString,
          },
          crop: {
            type: GraphQLString,
          },
          trim: {
            type: GraphQLString,
          },
          pad: {
            type: GraphQLString,
          },
          quality: {
            type: GraphQLInt,
            defaultValue: 50,
          },
        }
      );

      fieldConfig.type = GraphQLJSON;

      return fieldConfig;
    } catch (error) {
      reporter.panic({
        id: CODES.MissingDependencyError,
        context: { sourceMessage: `Gatsby plugin image is required. Please check https://github.com/contentstack/gatsby-source-contentstack#the-new-gatsby-image-plugin for more help.` },
        error
      });
    }
  };

  const gatsbyImageData = await getGatsbyImageData();
  return { gatsbyImageData };
};