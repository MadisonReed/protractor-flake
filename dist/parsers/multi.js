'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = {
  name: 'multi',

  parse: function parse(output) {
    var match = null;
    var failedSpecs = [];
    var testsOutput = output.split('------------------------------------');
    var RESULT_REG = /,\s0 failures/g;
    var SPECFILE_REG = /.+Specs:\s(.*\.js)/g;
    var blacklist = [/\/scripts\/helpers\//ig, /\/mr_modules\/automation\//ig];

    testsOutput.forEach(function (test) {
      var specfile = undefined;
      var result = 'failed';
      // retrieve specfile from run
      while (match = SPECFILE_REG.exec(test)) {
        // eslint-disable-line no-cond-assign
        specfile = match[1];
      }
      // check for string '0 failures' and then marks the test as passed
      while (match = RESULT_REG.exec(test)) {
        // eslint-disable-line no-cond-assign
        result = 'passed';
      }
      if (specfile && result === 'failed') {
        if (!/node_modules/.test(specfile)) {
          var failedSpecsSet = new Set(failedSpecs);

          if (failedSpecsSet.has(specfile) === false) {
            var blacklisted = false;
            for (var i = 0; i < blacklist.length; i++) {
              if (specfile.match(blacklist[i]) !== null && !blacklisted) {
                process.stdout.write("\n" + specfile + ' is blacklisted.');
                blacklisted = true;
              }
            }
            if (!blacklisted) {
              process.stdout.write("\n" + 'not blacklisted pushing ' + specfile);
              failedSpecs.push(specfile);
            }
          }
        }
      }
    });

    return failedSpecs;
  }
};
module.exports = exports['default'];