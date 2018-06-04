const fs = require('fs-extra');

module.exports = function writeConfig(type, config) {
  let contents = typeof config == 'object' ? `module.exports = ${JSON.stringify(config)}` : config;
  return fs.outputFile(`./config/${type}.js`, contents);
};
