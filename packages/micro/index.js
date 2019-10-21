const findUp = require('find-up')

exports.utils = {
  config: require('@nautilus/core/lib/config')
}

const hooks = [
  'response',
  'models'
]

exports.nautilus = (next, config) => {
  if (!config) {
    const foundConfig = findUp.sync('config', {
      cwd: module.parent.filename,
      type: 'directory'
    })
    config = foundConfig ? this.utils.config(foundConfig) : {}
  }

  return hooks.filter(hook => config[hook] !== false).reverse()
    .map(m => require('./lib/' + m))
    .reduce((stack, hook) => hook(stack, config), next)
}
