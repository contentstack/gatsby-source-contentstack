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