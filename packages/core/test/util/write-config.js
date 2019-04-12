const path = require('path')
const fs = require('fs-extra')

module.exports = function writeConfig (location, config, cb) {
  config = 'module.exports = ' + JSON.stringify(config)
  fs.outputFile(path.join(__dirname, '..', '..', location + '.js'), config, cb)
}
