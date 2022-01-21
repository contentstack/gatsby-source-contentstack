'use strict';

// const { setFieldsOnGraphQLNodeType } = require('./extend-node-type');
const { sourceNodes } = require('./source-node');
const { onPreBootstrap } = require('./pre-bootstrap');
const { pluginOptionsSchema } = require('./plugin-options-schema');
const { onPluginInit } = require('./plugin-init');
const { createSchemaCustomization } = require('./create-schema-customization');
const { createResolvers } = require('./create-resolvers');

exports.onPreBootstrap = onPreBootstrap;

exports.createSchemaCustomization = createSchemaCustomization;

exports.sourceNodes = sourceNodes;

// exports.setFieldsOnGraphQLNodeType = setFieldsOnGraphQLNodeType;

exports.createResolvers = createResolvers;

exports.pluginOptionsSchema = pluginOptionsSchema;

exports.onPluginInit = onPluginInit;
