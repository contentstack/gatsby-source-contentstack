'use strict';

exports.onPreBootstrap = function (_ref) {
  var reporter = _ref.reporter;
  var args = process.argv;
  if (args.includes('--verbose')) {
    reporter.setVerbose(true);
  }
};
//# sourceMappingURL=pre-bootstrap.js.map