exports.vary = res => value =>
  res.setHeader('Vary', Array.from(new Set([res.getHeader('Vary'), value].filter(Boolean))).join(', '))

exports.handler = (next, { cors: config = {} } = {}) => {
  const {
    allowCredentials = true,
    allowHeaders = [],
    allowMethods = ['DELETE', 'GET', 'HEAD', 'PATCH', 'POST', 'PUT'],
    allowOrigin = '*',
    exposeHeaders = [],
    maxAge = 7200
  } = config

  return async (req, res, app = {}) => {
    res.vary = exports.vary(res)
    res.setHeader('Access-Control-Allow-Origin', allowOrigin)

    if (allowCredentials && allowOrigin === '*' && req.headers.referer) {
      // Allow a wildcard origin that switches to a Referer hostname for
      // authenticated requests. To opt-out, manually specify the allowed origin
      // or use the pipe syntax to restrict only credentialed requests.
      // @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSNotSupportingCredentials
      // @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#access-control-allow-origin
      const { protocol, host } = new URL(req.headers.referer)
      res.setHeader('Access-Control-Allow-Origin', [protocol, host].join('//'))
      res.vary('Origin')
    }

    if (allowCredentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true')
    }

    if (exposeHeaders.length) {
      res.setHeader('Access-Control-Expose-Headers', exposeHeaders.join(','))
    }

    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Headers', allowHeaders.join(',') || req.headers['access-control-request-headers'] || '')
      if (!allowHeaders.length) {
        res.vary('Access-Control-Request-Headers')
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
