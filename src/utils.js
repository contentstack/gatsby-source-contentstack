'use strict';

const ProgressBar = require('progress');

exports.createProgress = function (message, reporter) {
  if (reporter && reporter.createProgress) {
    return reporter.createProgress(message);
  }

  const bar = new ProgressBar(` [:bar] :current/:total :elapsed s :percent ${message}`, {
    total: 0,
    width: 30,
    clear: true
  });

  return {
    start() { },
    tick() {
      bar.tick();
    },
    done() { },
    set total(value) {
      bar.total = value;
    }
  }
};

exports.checkIfUnsupportedFormat = data => {
  // Get every char after ".", $ is from end
  // eslint-disable-next-line
  let extenstionReg = /[^.]+$/,
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
exports.IMAGE_REGEXP = new RegExp('https://(stag-images|(eu-)?images).(blz-)?contentstack.(io|com)/v3/assets/');
exports.ASSET_NODE_UIDS = 'ASSET_NODE_UIDS';

exports.CODES = {
  SyncError: '10001',
  APIError: '10002',
  ImageAPIError: '10003',
  MissingDependencyError: '10004',
};

exports.getContentTypeOption = configOptions => {
  const contentTypeOptions = ['contentTypes', 'excludeContentTypes'];
  const configOptionKeys = Object.keys(configOptions);

  let contentTypeOption = '';

  for (let i = 0; i < configOptionKeys.length; i++) {
    const configOptionKey = configOptionKeys[i];
    if (contentTypeOptions.includes(configOptionKey)) {
      contentTypeOption = configOptionKey;
      break;
    }
  }
  if (configOptions.locales?.length) {
    contentTypeOption += 'locales';
  }
  return contentTypeOption;
};