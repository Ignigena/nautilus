const fs = require('fs')
const { parse, resolve } = require('path')

const merge = require('deepmerge')

const flatLoader = require('./flat')

/**
 * Structured configuration loader with namespacing based on discovered paths.
 * @param {String} directory - Path to the configuration directory.
 * @returns {Object}
 */
module.exports = (directory) => {
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

  const envConfig = flatLoader(resolve(directory, 'env'))

  return merge(config, envConfig)
}
