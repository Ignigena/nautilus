const fs = require('fs');

module.exports = function writeConfig(type, config, cb) {
  if (!fs.existsSync('./config')) fs.mkdirSync('./config');
  fs.writeFile(`./config/${type}.js`, config, cb);
};
