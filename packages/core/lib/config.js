// Configuration
// =============
const fs = require('fs')
const merge = require('deepmerge')

module.exports = function NautilusCoreConfig (app) {
  app.config = {}
  // Defaults
  // --------
  // Default configuration can be provided by the framework to allow for less
  // initial config and sane defaults. It is the lowest level of configuration
  // and will be overwritten by any user-supplied configuration.
  let defaultConfig = new app.Loader(`${app.frameworkPath}/lib/defaults`).all()

  if (!fs.existsSync(`${app.appPath}/config`)) {
    app.config = merge(defaultConfig, app.runtimeConfig)
    return
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
  let envConfig = {}
  let localConfig = {}

  app.config = new app.Loader(`${app.appPath}/config`).matching(/^(?!.*\/env\/.*).*\.js$/)

  // Environment
  // -----------
  // Environment configuration allows to further specify custom configuration
  // based on the environment in which this server is running. It will override
  // any global settings but can itself still be overridden by `local.js`.
  try {
    let env = process.env.NODE_ENV || 'development'
    envConfig = require(`${app.appPath}/config/env/${env}.js`)
    app.config = merge(app.config, envConfig)
  } catch (e) {}

  // Local
  // -----
  // Local configuration can be provided through a single file `local.js` which
  // can be used for local development but should be ignored from GIT. Anything
  // provided in this file will override all existing settings.
  try {
    localConfig = require(`${app.appPath}/config/env/local.js`)
    app.config = merge(app.config, localConfig)
  } catch (e) {}

  // Any environment configuration that doesn't match the current is cleaned up.
  delete app.config.env

  // Runtime
  // -------
  // Runtime configuration can be provided when creating the application by
  // passing a keyed object to the constructor method. This is the highest level
  // of configuration and will override all environment and local configuration.
  app.config = merge(defaultConfig, app.config)
  app.config = merge(app.config, app.runtimeConfig)
}
