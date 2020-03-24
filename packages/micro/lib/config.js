const { dirname } = require('path')

const loadConfig = require('@nautilus/config')
const stack = require('callsites')
const findUp = require('find-up')

exports.setup = config => {
  if (config) return config

  const foundConfig = findUp.sync('config', {
    cwd: dirname(stack()[2].getFileName()),
    type: 'directory'
  })

  return foundConfig ? loadConfig(foundConfig) : {}
}

exports.handler = (next, config) => {
  config = Object.freeze(this.setup(config))
  return async (req, res, app = {}) => {
    app.config = config
    next(req, res, app)
  }
}
