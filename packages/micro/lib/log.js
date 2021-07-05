const crypto = require('crypto')

const levels = [
  'error',
  'warn',
  'info',
  'verbose',
  'debug'
]

/**
 * Generates a random RFC 4122 Version 4 UUID. `crypto.randomUUID` is fastest but
 * only available on Node 15 or greater. Once Node 16 is LTS and supported as an
 * AWS Lambda runtime, this will be removed in favor of the built-in Node method.
 * @returns {String}
 */
function uuidv4 () {
  if (crypto.randomUUID) return crypto.randomUUID()
  return [8, 13, 18, 23].reduce(
    (uuid, i) => uuid.substring(0, i) + '-' + uuid.substring(i),
    crypto.randomBytes(16).toString('hex')
  )
}

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
    req.correlation = req.headers[header] || uuidv4()
    res.setHeader(header, req.correlation)
    app.log = logging(level, req.correlation)

    next(req, res, app)
  }
}
