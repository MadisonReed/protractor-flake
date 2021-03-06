import {spawn} from 'child_process'
import {resolve} from 'path'
import {getParser} from './parsers'
import 'core-js/shim'
import log from './logger'

const DEFAULT_PROTRACTOR_ARGS = []

const DEFAULT_OPTIONS = {
  nodeBin: 'node',
  maxAttempts: 3,
  protractorArgs: DEFAULT_PROTRACTOR_ARGS,
  parser: 'standard'
}

var DYNAMIC_MODE_PATTERN = '-m';

function filterArgs (protractorArgs, specs) {
  var index = protractorArgs.indexOf(DYNAMIC_MODE_PATTERN);
  if (index !== -1) {
    protractorArgs.splice((index + 1), 1, '\'' + specs.join(',') + '\'');
  } else {
    protractorArgs.push(DYNAMIC_MODE_PATTERN, '\'' + specs.join(',') + '\'');
  }
  return protractorArgs;
}

export default function (options = {}, callback = function noop () {}) {
  let parsedOptions = Object.assign(DEFAULT_OPTIONS, options)
  let parser = getParser(parsedOptions.parser)
  let testAttempt = 1

  function handleTestEnd (status, output = '') {
    if (status === 0) {
      callback(status)
    } else {
      if (++testAttempt <= parsedOptions.maxAttempts) {
        log('info', `\nUsing ${parser.name} to parse output\n`)
        let failedSpecs = parser.parse(output)

        log('info', `Re-running tests: test attempt ${testAttempt}\n`)
        if (failedSpecs.length === 0) {
          log('info', '\nTests failed but no specs were found. All specs will be run again.\n\n')
        } else {
          log('info', 'Re-running the following test files:\n')
          log('info', failedSpecs.join('\n') + '\n')
        }
        return startProtractor(failedSpecs)
      }

      callback(status, output)
    }
  }

  function startProtractor (specFiles = []) {
    let protractorBinPath
    if (parsedOptions.protractorPath) {
      protractorBinPath = resolve(parsedOptions.protractorPath)
    } else {
      // '.../node_modules/protractor/lib/protractor.js'
      let protractorMainPath = require.resolve('protractor')
      // '.../node_modules/protractor/bin/protractor'
      protractorBinPath = resolve(protractorMainPath, '../../bin/protractor')
    }

    let protractorArgs = [protractorBinPath].concat(parsedOptions.protractorArgs)
    let output = ''

    if (specFiles.length) {
      protractorArgs = filterArgs(protractorArgs, specFiles);
    }

    let protractor = spawn(
      parsedOptions.nodeBin,
      protractorArgs,
      options.protractorSpawnOptions
    )

    protractor.stdout.on('data', (buffer) => {
      let text = buffer.toString()
      log('info', text)
      output = output + text
    })

    protractor.stderr.on('data', (buffer) => {
      let text = buffer.toString()
      log('info', text)
      output = output + text
    })

    protractor.on('exit', function (status) {
      handleTestEnd(status, output)
    })
  }

  startProtractor()
}
