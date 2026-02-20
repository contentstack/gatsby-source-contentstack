'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _require = require('./utils'),
  CODES = _require.CODES;
var ERROR_MAP = (0, _defineProperty2["default"])((0, _defineProperty2["default"])((0, _defineProperty2["default"])((0, _defineProperty2["default"])({}, CODES.SyncError, {
  text: function text(context) {
    return context.sourceMessage;
  },
  level: "ERROR",
  type: "PLUGIN"
}), CODES.APIError, {
  text: function text(context) {
    return context.sourceMessage;
  },
  level: "ERROR",
  type: "PLUGIN"
}), CODES.ImageAPIError, {
  text: function text(context) {
    return context.sourceMessage;
  },
  level: "ERROR",
  type: "PLUGIN"
}), CODES.MissingDependencyError, {
  text: function text(context) {
    return context.sourceMessage;
  },
  level: "ERROR",
  type: "PLUGIN"
});
exports.onPluginInit = function (_ref) {
  var reporter = _ref.reporter;
  reporter.setErrorMap(ERROR_MAP);
};
//# sourceMappingURL=plugin-init.js.map