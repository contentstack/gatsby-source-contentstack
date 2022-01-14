'use strict';

const { CODES } = require('./utils');

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

exports.onPluginInit = ({ reporter }) => {
  reporter.setErrorMap(ERROR_MAP);
};