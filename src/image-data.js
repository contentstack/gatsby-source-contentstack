'use strict';

const { GraphQLInt, GraphQLJSON, GraphQLString } = require('gatsby/graphql');

const { resolveGatsbyImageData } = require('./gatsby-plugin-image');
const { CODES } = require('./utils');

exports.getGatsbyImageData = async ({ cache, reporter }) => {
  let fieldConfig = {};
  try {
    const { getGatsbyImageFieldConfig } = await import('gatsby-plugin-image/graphql-utils');

    fieldConfig = getGatsbyImageFieldConfig(
      async (image, options) => resolveGatsbyImageData({ image, options, cache, reporter }), {
      fit: { type: GraphQLString, },
      crop: { type: GraphQLString, },
      trim: { type: GraphQLString, },
      pad: { type: GraphQLString, },
      quality: { type: GraphQLInt, defaultValue: 50, },
    });

    fieldConfig.type = GraphQLJSON;
  } catch (error) {
    reporter.info({
      id: CODES.MissingDependencyError,
      context: { sourceMessage: `Gatsby plugin image is required to use new gatsby image plugin's feature. Please check https://github.com/contentstack/gatsby-source-contentstack#the-new-gatsby-image-plugin for more help.` },
    });
  }

  const gatsbyImageData = fieldConfig;
  return { gatsbyImageData };
};