const path = require('path')
const fs = require('fs-extra')

module.exports = function writeConfig (location, config) {
  const contents = typeof config === 'object' ? `module.exports = ${JSON.stringify(config)}` : config
  return fs.outputFile(path.resolve(__dirname, `../../${location}.js`), contents)
}
