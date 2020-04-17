const merge = require('deepmerge')

const loaders = require('./loaders')

/**
 * Load configuration from one or more directories.
 * @param {String|Array} paths
 * @param {Object} config
 * @param {String} config.env - Applies environment configuration over the top
 * of the defaults if a file exists with a matching name. If not specified uses
 * `process.env.DEPLOY_ENV`, `process.env.NODE_ENV` or `development`.
 * @param {Boolean} config.flat - Use the flat loader instead of the default.
 */
module.exports = (paths, config = {}) => {
  const {
    env = process.env.DEPLOY_ENV || process.env.NODE_ENV || 'development',
    flat = false,
    ...runtimeConfig
  } = config

  return merge(
    (Array.isArray(paths) ? paths : [paths])
      .reduce((result, directory) =>
        merge(result, loaders[flat ? 'flat' : 'default']({ directory, env })), {}),
    runtimeConfig || {}
  )
}
