module.exports = (next, { cors: config = {} } = {}) => {
  const {
    allowCredentials = false,
    allowHeaders = [],
    allowMethods = ['DELETE', 'GET', 'HEAD', 'PATCH', 'POST', 'PUT'],
    allowOrigin = '*',
    exposeHeaders = [],
    maxAge = 7200
  } = config

  return async (req, res, app = {}) => {
    res.setHeader('Access-Control-Allow-Origin', allowOrigin)

    if (allowCredentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true')
    }

    if (exposeHeaders.length) {
      res.setHeader('Access-Control-Expose-Headers', exposeHeaders.join(','))
    }

    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Headers', allowHeaders.join(',') || req.headers['access-control-request-headers'])
      if (!allowHeaders.length) {
        res.setHeader('Vary', 'Access-Control-Request-Headers')
      }
      res.setHeader('Access-Control-Allow-Methods', allowMethods.join(','))
      res.setHeader('Access-Control-Max-Age', String(maxAge))
      res.setHeader('Content-Length', '0')
      res.statusCode = 204
      res.end()
      return
    }

    next(req, res, app)
  }
}
