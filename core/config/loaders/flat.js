const { resolve } = require('path')

const merge = require('deepmerge')

/**
 * Flat configuration loader which follows the same merge strategy but without
 * the namespacing. Each environment configuration is expected to be in the
 * same directory. This can be used along with the Webpack EnvironmentPlugin or
 * anywhere a simpler configuration structure is warranted.
 * @param {String} directory - Path to the configuration directory.
 * @returns {Object}
 */
module.exports = (directory) =>
  [
    'default',
    process.env.DEPLOY_ENV || process.env.NODE_ENV || 'development',
    'local'
  ].reduce((config, env) => {
    try {
      config = merge(config, require(resolve(directory, env)))
    } catch (e) {}
    return config
  }, {})
