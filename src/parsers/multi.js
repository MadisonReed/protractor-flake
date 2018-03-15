export default {
  name: 'multi',

  parse (output) {
    let match = null
    let failedSpecs = []
    let testsOutput = output.split('------------------------------------')
    let RESULT_REG = /,\s0 failures/g
    let SPECFILE_REG = /.+Specs:\s(.*\.js)/g
    let blacklist = [
      /\/scripts\/helpers\//ig,
      /\/mr_modules\/automation\//ig
    ]
    
    testsOutput.forEach(function (test) {
      let specfile
      let result = 'failed'
      // retrieve specfile from run
      while (match = SPECFILE_REG.exec(test)) { // eslint-disable-line no-cond-assign
        specfile = match[1]
      }
      // check for string '0 failures' and then marks the test as passed
      while (match = RESULT_REG.exec(test)) { // eslint-disable-line no-cond-assign
        result = 'passed'
      }
      if (specfile && result === 'failed') {
        if (!/node_modules/.test(specfile)) {
          var failedSpecsSet = new Set(failedSpecs);         

          if (failedSpecsSet.has(specfile) === false) {
            var blacklisted = false;
            for (var i = 0; i < blacklist.length; i++) {
              if (specfile.match(blacklist[i]) !== null && !blacklisted) {
                process.stdout.write("\n"+specfile + ' is blacklisted.');
                blacklisted = true;
              }
            }
            if (blacklisted) {
              continue;
            }
            failedSpecs.push(specfile);
          }
        }
      }
    })

    return failedSpecs
  }
}
