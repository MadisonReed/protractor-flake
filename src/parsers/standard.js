export default {
  name: 'standard',

  parse (output) {
    let failedSpecs = new Set()
    let match = null
    let FAILED_LINES = /at (?:\[object Object\]|Object)\.<anonymous> \((([A-Za-z]:\\)?.*?):.*\)/g
    let blacklist = [
      /automation.js/ig,
      /multiPlatformTests.js/ig,
      /mobileTests.js/ig,
      /tophatTests.js/ig,
      /webTests.js/ig
    ]

    while (match = FAILED_LINES.exec(output)) { // eslint-disable-line no-cond-assign
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

    return [...failedSpecs]
  }
}
