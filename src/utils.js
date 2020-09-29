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

exports.checkIfSvg = data => {
  // Get every char after ".", $ is from end
  // eslint-disable-next-line
  let extenstionReg = /[^.]+$/,
    extName = '';
  try {
    extName = extenstionReg.exec(data);
    extName = extName && extName.length ? extName[0] : null;
  } catch (err) {
    error(errStr);
    throw new Error(err);
  }
  return extName === 'svg' ? true : false;
};