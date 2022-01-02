'use strict';

exports.onPreBootstrap = ({ reporter }) => {
  const args = process.argv;
  if (args.includes('--verbose')) {
    reporter.setVerbose(true);
  }
};