const fs = require('fs')
const { parse, resolve } = require('path')

const flatLoader = require('./flat')
const merge = require('../merge')

/**
 * Structured configuration loader with namespacing based on discovered paths.
 * @param {Object} config
 * @param {String} config.directory - Path to the configuration directory.
 * @param {String} config.env - Environment configuration to use.
 * @returns {Object}
 */
module.exports = ({ directory, env }) => {
  let config
  try {
    config = fs.readdirSync(directory).reduce((config, path) => {
      const { ext, name } = parse(path)
      if (ext !== '.js' && ext !== '.json') return config
      config[name] = require(resolve(directory, `./${name}`))
      return config
    }, {})
  } catch (e) {
    config = {}
  }

  const envConfig = flatLoader({ directory: resolve(directory, 'env'), env })

  return merge(config, envConfig)
}
