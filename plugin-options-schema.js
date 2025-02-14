'use strict';

var _require = require('./node-helper'),
  validateContentstackAccess = _require.validateContentstackAccess;
exports.pluginOptionsSchema = function (_ref) {
  var Joi = _ref.Joi;
  return Joi.object({
    api_key: Joi.string().required().description("API Key is a unique key assigned to each stack."),
    delivery_token: Joi.string().required().description("Delivery Token is a read-only credential."),
    environment: Joi.string().required().description("Environment where you published your data."),
    branch: Joi.string()["default"]('main').description("Specify a branch from where you'd like to fetch the data. Default it will be fetched from main"),
    cdn: Joi.string()["default"]("https://cdn.contentstack.io/v3").description("CDN set this to point to other cdn end point. For eg: https://eu-cdn.contentstack.com/v3 "),
    type_prefix: Joi.string()["default"]("Contentstack").description("Specify a different prefix for types. This is useful in cases where you have multiple instances of the plugin to be connected to different stacks."),
    expediteBuild: Joi["boolean"]()["default"](false).description("expediteBuild set this to either true or false."),
    enableSchemaGeneration: Joi["boolean"]()["default"](false).description("Specify true if you want to generate custom schema."),
    disableMandatoryFields: Joi["boolean"]()["default"](false).description("Specify true if you want to generate optional graphql fields for mandatory Contentstack fields"),
    downloadImages: Joi["boolean"]()["default"](false).description("Specify true if you want to download all your contentstack images locally"),
    contentTypes: Joi.array().items(Joi.string().required()).description("Specify list of content-types to be fetched from contentstack"),
    excludeContentTypes: Joi.array().items(Joi.string().required()).description("Specify list of content-types to be excluded while fetching data from contentstack"),
    locales: Joi.array().items(Joi.string().required()).description("Specify list of locales to be fetched from contentstack"),
    jsonRteToHtml: Joi["boolean"]()["default"](false).description("Specify true if you want to generate html from json RTE field"),
    httpRetries: Joi.number().integer()["default"](3).description("Specify the number of times to perform http request on a network failure"),
    limit: Joi.number().integer()["default"](50).description("Specify the number of entries/assets to be fetched per page"),
    enableEarlyAccessKey: Joi.string()["default"]('').description("Specify the Header key to be passed to Contentstack API"),
    enableEarlyAccessValue: Joi.string()["default"]('').description("Specify list of headers to be passed to Contentstack API.")
  }).external(validateContentstackAccess);
};
//# sourceMappingURL=plugin-options-schema.js.map