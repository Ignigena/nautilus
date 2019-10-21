// Configuration
// =============
const fs = require('fs')
const { parse, resolve } = require('path')

const merge = require('deepmerge')

function NautilusCoreConfig (configPath) {
  // General
  // -------
  // All configuration can be set through individual files in the specified
  // directory. These will be namespaced according to their file name:
  // ```
  // config/
  //   security.js
  //   views.js
  // ```
  // are avaialable at `app.config.security` and `app.config.views`.
  let config
  try {
    config = fs.readdirSync(configPath).reduce((config, path) => {
      const { ext, name } = parse(path)
      if (ext !== '.js' && ext !== '.json') return config
      config[name] = require(resolve(configPath, `./${name}`))
      return config
    }, {})
  } catch (e) {
    config = {}
  }

  // Environment
  // -----------
  // Environment configuration allows to further specify custom configuration
  // based on the environment in which this server is running. It will override
  // any global settings but can itself still be overridden by `local.js`.
  try {
    const env = process.env.DEPLOY_ENV || process.env.NODE_ENV || 'development'
    config = merge(config, require(resolve(configPath, `./env/${env}.js`)))
  } catch (e) {}

  // Local
  // -----
  // Local configuration can be provided through a single file `local.js` which
  // can be used for local development but should be ignored from GIT. Anything
  // provided in this file will override all existing settings.
  try {
    config = merge(config, require(resolve(configPath, './env/local.js')))
  } catch (e) {}

  return config
}

module.exports = (paths, runtimeConfig = {}) => {
  if (!Array.isArray(paths)) {
    return merge(NautilusCoreConfig(paths), runtimeConfig)
  }

  const config = paths.reduce((result, path) => merge(result, NautilusCoreConfig(path)), {})

  // Runtime
  // -------
  // Runtime configuration can be provided when creating the application by
  // passing a keyed object to the constructor method. This is the highest level
  // of configuration and will override all environment and local configuration.
  return merge(config, runtimeConfig)
}
