const { resolve } = require('path')

const merge = require('../merge')

/**
 * Flat configuration loader which follows the same merge strategy but without
 * the namespacing. Each environment configuration is expected to be in the
 * same directory. This can be used along with the Webpack EnvironmentPlugin or
 * anywhere a simpler configuration structure is warranted.
 * @param {Object} config
 * @param {String} config.directory - Path to the configuration directory.
 * @param {String} config.env - Environment configuration to use.
 * @param {Boolean} config.ignoreLocal - Ignore local configuration.
 * @returns {Object}
 */
module.exports = ({ directory, env, ignoreLocal }) =>
  ['default', env, !ignoreLocal && 'local'].reduce((config, file) => {
    try {
      config = merge(config, require(resolve(directory, file)))
    } catch (e) {}
    return config
  }, {})
