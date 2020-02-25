const { v1: uuidv1 } = require('uuid')

const levels = [
  'error',
  'warn',
  'info',
  'verbose',
  'debug'
]

/**
 * The logging middleware is kept purposefully lightweight and is simply a
 * wrapper around the `console` methods with support for configurable levels.
 * Especially in microservices, the application should not be routing logs so
 * we always output to stdout.
 */
function logging (level, correlation) {
  const shouldSuppress = verb => levels.indexOf(verb) > levels.indexOf(level)

  return levels.reduce((methods, verb) => {
    methods[verb] = function (...args) {
      if (level === 'silent' || shouldSuppress(verb)) return
      (console[verb] || console.log)(correlation, ...args)
    }
    return methods
  }, {})
}

module.exports = (next, { log: config = {} } = {}) => {
  const {
    header = 'x-correlation-id',
    level = 'info'
  } = config

  return async (req, res, app = {}) => {
    req.correlation = req.headers[header] || uuidv1()
    app.log = logging(level, req.correlation)

    next(req, res, app)
  }
}
