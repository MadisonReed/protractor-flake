export default {
  name: 'standard',

  parse (output) {
    let failedSpecs = new Set()
    let match = null
    let FAILED_LINES = /at (?:\[object Object\]|Object)\.<anonymous> \((([A-Za-z]:\\)?.*?):.*\)/g
    let blacklist = [
      /\/scripts\/helpers\//ig,
      /\/mr_modules\/automation\//ig
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
    // let's account for error code: 1 failures
    let log = output.split('\n')
    const PATH_REGEX = /Specs: ([a-zA-Z_\/]+\.js)/
    const ERROR_CODE_REGEX = /Runner process exited unexpectedly with error code: ([0-9]+)/
    const ASSERTION_ERROR_REGEX = /Error: Failed expectation/
    var path
    log.forEach(row => {
      if (PATH_REGEX.test(row)) {
        path = row.match(PATH_REGEX)[1];
      }

      if (ERROR_CODE_REGEX.test(row) || ASSERTION_ERROR_REGEX.test(row)) {
        failedSpecs.add(path);
      }
    });
    
    return [...failedSpecs]
  }
}
