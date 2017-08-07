const path = require('path');
const fs = require('fs-extra');

module.exports = (location, hook, cb, order) => {
  let hookName = path.basename(location);
  hook = `module.exports = ${hookName}; function ${hookName}(app) { ${hook} };`;
  if (order) hook += `${hookName}.prototype.order = ${order};`;
  fs.outputFile(location + '.js', hook, cb);
};
