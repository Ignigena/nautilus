const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const requireAll = require('require-all');

module.exports = function loadApi(location, type) {
  if (!fs.existsSync(`${location}/api`)) return {};

  let apiDefinition = requireAll({
    dirname: `${location}/api`,
    filter: new RegExp(`(.+)\.${type}\.js$`),
    map: (name, absPath) => path.basename(absPath, `.${type}.js`),
  });

  apiDefinition = _.mapValues(apiDefinition, (model, key) => model[key]);
  apiDefinition = _.omitBy(apiDefinition, _.isUndefined);

  return apiDefinition;
};
