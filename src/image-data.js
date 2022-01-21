'use strict';

const { GraphQLInt, GraphQLJSON, GraphQLString } = require('gatsby/graphql');

const { resolveGatsbyImageData } = require('./gatsby-plugin-image');

exports.getGatsbyImageData = async ({ cache, reporter }) => {
  let fieldConfig = {};
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

  const gatsbyImageData = fieldConfig;
  return { gatsbyImageData };
};