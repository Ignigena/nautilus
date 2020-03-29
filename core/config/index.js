const merge = require('deepmerge')

const loaders = require('./loaders')

/**
 * Load configuration from one or more directories.
 * @param {String|Array} paths
 * @param {Object} runtimeConfig
 */
module.exports = (paths, runtimeConfig = {}) =>
  merge(
    (Array.isArray(paths) ? paths : [paths])
      .reduce((result, path) => merge(result, loaders.default(path)), {}),
    runtimeConfig
  )
