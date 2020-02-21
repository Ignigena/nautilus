const findUp = require('find-up')

exports.utils = {
  config: require('@nautilus/core/lib/config')
}

const hooks = [
  'response',
  'models'
]

/**
 * Zero-config handler for most out-of-the-box setups. You should use this if
 * you'll use most of the functionality that comes built in to the framework.
 * @param {Function} next - The last middleware handler that will be called.
 * @param {Object} config - Optional configuration, otherwise configuration
 * will be loaded from the closest `config` directory in the app.
 * @return {Function} A request/response handler.
 */
exports.nautilus = (next, config) => {
  if (!config) {
    const foundConfig = findUp.sync('config', {
      cwd: module.parent.filename,
      type: 'directory'
    })
    config = foundConfig ? this.utils.config(foundConfig) : {}
  }

  return exports.withMiddleware(hooks.filter(hook => config[hook] !== false))(next, config)
}

/**
 * For more advanced setups, the `withMiddleware` option comes with no assumptions
 * about your approach. You can intermix your own hooks with the core ones based
 * on the needs of your application.
 * @param {Array<String|Function>} hooks - If a string is provided, it is assumed
 * to be a core Nautilus hook. Otherwise, a function or `require` should be used
 * to define custom hooks.
 * @return {Function} The middleware stack, ready to wrap your handler.
 */
exports.withMiddleware = hooks => {
  const stack = hooks.reverse().map(m => (typeof m === 'string') ? require('./lib/' + m) : m)
  return (next, ...args) => stack.reduce((stack, hook) => hook(stack, ...args), next)
}
