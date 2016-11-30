'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

exports['default'] = {
  name: 'standard',

  parse: function parse(output) {
    var failedSpecs = new Set();
    var match = null;
    var FAILED_LINES = /at (?:\[object Object\]|Object)\.<anonymous> \((([A-Za-z]:\\)?.*?):.*\)/g;
    var blacklist = [/\/scripts\/helpers\//ig, /\/mr_modules\/automation\//ig];

    while (match = FAILED_LINES.exec(output)) {
      // eslint-disable-line no-cond-assign
      // windows output includes stack traces from
      // webdriver so we filter those out here
      if (!/node_modules/.test(match[1])) {
        var specfile = match[1];
        if (failedSpecs.has(specfile) === false) {
          var blacklisted = false;
          for (var i = 0; i < blacklist.length; i++) {
            if (specfile.match(blacklist[i]) !== null && !blacklisted) {
              blacklisted = true;
            }
          }
          if (!blacklisted) {
            failedSpecs.add(specfile);
          }
        }
      }
    }

    return [].concat(_toConsumableArray(failedSpecs));
  }
};
module.exports = exports['default'];