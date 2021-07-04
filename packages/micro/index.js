const { setup } = require('./lib/config')

exports.utils = {
  config: require('@nautilus/config')
}

const middleware = [
  'config',
  'cors',
  'log',
  'parse',
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
  config = setup(config)
  return this.withMiddleware(middleware.filter(hook => config[hook] !== false))((req, res, app) => {
    req.app = app
    next(req, res, app)
  }, config)
}

/**
 * For more advanced setups, the `withMiddleware` option comes with no assumptions
 * about your approach. You can intermix your own middleware with the core ones based
 * on the needs of your application.
 * @param {Array<String|Function>} middleware - If a string is provided, it is assumed
 * to be a core Nautilus middleware. Otherwise, a function or `require` should be used
 * to define custom middleware.
 * @return {Function} The middleware stack, ready to wrap your handler.
 */
exports.withMiddleware = middleware => {
  const stack = middleware.reverse().map(m => {
    const func = (typeof m === 'string') ? require('./lib/' + m) : m
    return typeof func === 'function' ? func : func.handler
  })

  return (next, ...args) => stack.reduce((stack, hook) => hook(stack, ...args), next)
}
