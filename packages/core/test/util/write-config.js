const fs = require('fs-extra')

module.exports = function writeConfig (path, config, cb) {
  if (path.indexOf('/') < 0) path = 'config/' + path
  config = 'module.exports = ' + JSON.stringify(config)
  fs.outputFile(path + '.js', config, cb)
}
