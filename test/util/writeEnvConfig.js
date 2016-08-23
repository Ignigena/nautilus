const fs = require('fs');

module.exports = function writeConfig(type, config, cb) {
  if (!fs.existsSync('./config')) fs.mkdirSync('./config');
  if (!fs.existsSync('./config/env')) fs.mkdirSync('./config/env');
  fs.writeFile(`./config/env/${type}.js`, config, cb);
};
