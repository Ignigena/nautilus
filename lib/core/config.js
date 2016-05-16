// Configuration
// =============
const _ = require('lodash');
const fs = require('fs');
const requireAll = require('require-all');

module.exports = function configNautilus(app) {

  if (!fs.existsSync(`${app.appPath}/config`)) {
    app.config = {};
    return;
  }

  // General
  // -------
  // All configuration can be set through individual files in the `config`
  // directory. These will be namespaced according to their file name:
  // ```
  // config/
  //   security.js
  //   views.js
  // ```
  // are avaialable at `app.config.security` and `app.security.views`.
  try {
    app.config = requireAll({ dirname: `${app.appPath}/config` });
  } catch (e) {
    console.error(e);
    process.exit(-1);
  }

  // Environment
  // -----------
  // Environment configuration allows to further specify custom configuration
  // based on the environment in which this server is running. It will override
  // any global settings but can itself still be overridden by `local.js`.
  try {
    var envConfig = require(`${app.appPath}/config/env/${app.get('env')}.js`);
    app.config = _.merge(app.config, envConfig);
  } catch (e) {}

  // Local
  // -----
  // Local configuration can be provided through a single file `local.js` which
  // can be used for local development but should be ignored from GIT. Anything
  // provided in this file will override all existing settings.
  try {
    var localConfig = require(`${app.appPath}/config/local.js`);
    app.config = _.merge(app.config, localConfig);
  } catch (e) {}

};
