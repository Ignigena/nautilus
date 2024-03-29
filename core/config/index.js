const merge = require('./merge')
const loaders = require('./loaders')

/**
 * Load configuration from one or more directories. If the `dotenv` package is
 * installed it will be used to populate `process.env` variables.
 * @param {String|Array} paths
 * @param {Object} config
 * @param {Object} config.dotenv - Options to pass to `dotenv`
 * @param {String} config.env - Applies environment configuration over the top
 * of the defaults if a file exists with a matching name. If not specified uses
 * `process.env.DEPLOY_ENV`, `process.env.NODE_ENV` or `development`.,
 * @param {Boolean} config.flat - Use the flat loader instead of the default.
 * @param {Boolean} config.ignoreLocal - Ignore local configuration. Defaults to
 * `true` if the `NODE_ENV` has been set to `test` (ex. in Jest)
 */
module.exports = (paths, config = {}) => {
  const {
    dotenv,
    env = process.env.DEPLOY_ENV || process.env.NODE_ENV || 'development',
    flat = false,
    ignoreLocal,
    ...runtimeConfig
  } = config

  try {
    require('dotenv').config(dotenv)
  } catch (err) {}

  return merge(
    (Array.isArray(paths) ? paths : [paths])
      .reduce((result, directory) =>
        merge(result, loaders[flat ? 'flat' : 'default']({
          directory,
          env,
          ignoreLocal: ignoreLocal ?? env === 'test'
        })), {}),
    runtimeConfig || {}
  )
}
