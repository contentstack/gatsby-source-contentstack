'use strict';

var ProgressBar = require('progress');

exports.createProgress = function (message, reporter) {
  if (reporter && reporter.createProgress) {
    return reporter.createProgress(message);
  }

  var bar = new ProgressBar(' [:bar] :current/:total :elapsed s :percent ' + message, {
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

exports.checkIfSvg = function (data) {
  // Get every char after ".", $ is from end
  // eslint-disable-next-line
  var extenstionReg = /[^.]+$/,
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