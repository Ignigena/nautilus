const path = require('path')
const fs = require('fs-extra')

module.exports = function writeConfig (type, config) {
  const contents = typeof config === 'object' ? `module.exports = ${JSON.stringify(config)}` : config
  return fs.outputFile(path.resolve(__dirname, `../../config/${type}.js`), contents)
}
