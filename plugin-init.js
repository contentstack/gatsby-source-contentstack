'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _ERROR_MAP;
var _require = require('./utils'),
  CODES = _require.CODES;
var ERROR_MAP = (_ERROR_MAP = {}, (0, _defineProperty2["default"])(_ERROR_MAP, CODES.SyncError, {
  text: function text(context) {
    return context.sourceMessage;
  },
  level: "ERROR",
  type: "PLUGIN"
}), (0, _defineProperty2["default"])(_ERROR_MAP, CODES.APIError, {
  text: function text(context) {
    return context.sourceMessage;
  },
  level: "ERROR",
  type: "PLUGIN"
}), (0, _defineProperty2["default"])(_ERROR_MAP, CODES.ImageAPIError, {
  text: function text(context) {
    return context.sourceMessage;
  },
  level: "ERROR",
  type: "PLUGIN"
}), (0, _defineProperty2["default"])(_ERROR_MAP, CODES.MissingDependencyError, {
  text: function text(context) {
    return context.sourceMessage;
  },
  level: "ERROR",
  type: "PLUGIN"
}), _ERROR_MAP);
exports.onPluginInit = function (_ref) {
  var reporter = _ref.reporter;
  reporter.setErrorMap(ERROR_MAP);
};
//# sourceMappingURL=plugin-init.js.map