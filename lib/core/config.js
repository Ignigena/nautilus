// Configuration
// =============
const _ = require('lodash');
const fs = require('fs');
const requireAll = require('require-all');

module.exports = function NautilusCoreConfig(app) {
  // Defaults
  // --------
  // Default configuration can be provided by the framework to allow for less
  // initial config and sane defaults. It is the lowest level of configuration
  // and will be overwritten by any user-supplied configuration.
  let defaultConfig = {};
  if (fs.existsSync(`${app.frameworkPath}/lib/defaults`)) {
    defaultConfig = requireAll({
      dirname: `${app.frameworkPath}/lib/defaults`,
    });
  }

  if (!fs.existsSync(`${app.appPath}/config`)) {
    app.config = _.merge(defaultConfig, app.runtimeConfig);
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
  let envConfig = {};
  let localConfig = {};
  app.config = requireAll({ dirname: `${app.appPath}/config` });

  // Environment
  // -----------
  // Environment configuration allows to further specify custom configuration
  // based on the environment in which this server is running. It will override
  // any global settings but can itself still be overridden by `local.js`.
  try {
    envConfig = require(`${app.appPath}/config/env/${app.get('env')}.js`);
    app.config = _.merge(app.config, envConfig);
  } catch (e) {}

  // Local
  // -----
  // Local configuration can be provided through a single file `local.js` which
  // can be used for local development but should be ignored from GIT. Anything
  // provided in this file will override all existing settings.
  try {
    localConfig = require(`${app.appPath}/config/env/local.js`);
    app.config = _.merge(app.config, localConfig);
  } catch (e) {}

  // Any environment configuration that doesn't match the current is cleaned up.
  delete app.config.env;

  // Runtime
  // -------
  // Runtime configuration can be provided when creating the application by
  // passing a keyed object to the constructor method. This is the highest level
  // of configuration and will override all environment and local configuration.
  app.config = _.merge(defaultConfig, app.config, app.runtimeConfig);
};
