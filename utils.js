'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var ProgressBar = require('progress');
exports.createProgress = function (message, reporter) {
  if (reporter && reporter.createProgress) {
    return reporter.createProgress(message);
  }
  var bar = new ProgressBar(" [:bar] :current/:total :elapsed s :percent ".concat(message), {
    total: 0,
    width: 30,
    clear: true
  });
  return {
    start: function start() {},
    tick: function tick() {
      bar.tick();
    },
    done: function done() {},
    set total(value) {
      bar.total = value;
    }
  };
};
exports.checkIfUnsupportedFormat = function (data) {
  // Get every char after ".", $ is from end
  // eslint-disable-next-line
  var extenstionReg = /[^.]+$/,
    extName = '';
  try {
    extName = extenstionReg.exec(data);
    extName = extName && extName.length ? extName[0] : null;
  } catch (err) {
    throw new Error(err);
  }
  return extName === 'svg' || extName === 'gif' ? true : false;
};
exports.SUPPORTED_FILES_COUNT = 'SUPPORTED_FILES_COUNT';
exports.IMAGE_REGEXP = new RegExp('https://(stag-images|(eu-|azure-na-|azure-eu-|azure-k8s-)?images).(blz-)?contentstack.(io|com)/v3/assets/');
exports.ASSET_NODE_UIDS = 'ASSET_NODE_UIDS';
exports.CODES = {
  SyncError: '10001',
  APIError: '10002',
  ImageAPIError: '10003',
  MissingDependencyError: '10004'
};
exports.getContentTypeOption = function (configOptions) {
  var _configOptions$locale;
  var contentTypeOptions = ['contentTypes', 'excludeContentTypes'];
  var configOptionKeys = Object.keys(configOptions);
  var contentTypeOption = '';
  for (var i = 0; i < configOptionKeys.length; i++) {
    var configOptionKey = configOptionKeys[i];
    if (contentTypeOptions.includes(configOptionKey)) {
      contentTypeOption = configOptionKey;
      break;
    }
  }
  if ((_configOptions$locale = configOptions.locales) !== null && _configOptions$locale !== void 0 && _configOptions$locale.length) {
    contentTypeOption += 'locales';
  }
  return contentTypeOption;
};
exports.getJSONToHtmlRequired = function (jsonRteToHtml, field) {
  return jsonRteToHtml && field.field_metadata && field.field_metadata.allow_json_rte;
};
exports.getCustomHeaders = function (key, value) {
  var sanitizedKey = typeof key === 'string' ? key.trim() : '';
  var sanitizedValue = typeof value === 'string' ? value.trim() : '';
  if (!sanitizedKey || !sanitizedValue || !sanitizedKey.startsWith('x-')) {
    return {};
  }
  return (0, _defineProperty2["default"])({}, sanitizedKey, sanitizedValue.replace(/\s/g, ''));
};
//# sourceMappingURL=utils.js.map