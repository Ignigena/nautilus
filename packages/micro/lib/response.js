const { STATUS_CODES } = require('http')

const isStream = require('is-stream')

const camelcase = str => str.toLowerCase().replace(/[-\s]+(.)/g, (match, p1) => p1.toUpperCase()).replace(/\W/g, '')

exports.statuses = new Map([
  ...Object.entries(STATUS_CODES).map(([code, description]) => [
    parseInt(code),
    { short: camelcase(description), description }
  ]),
  [301, { short: 'redirect', description: 'Moved Permanently' }],
  [420, { short: 'enhanceYourCalm', description: 'Enhance Your Calm' }],
  [500, { short: 'error', description: 'Internal Server Error' }]
])

/**
 * Send a JSON response with correct headers. By default the JSON will be sent
 * with extra spacing to be more human-readable. If a status code has not already
 * been provided, a 200 "OK" status will automatically be used.
 */
exports.json = res => jsonBody => {
  const body = JSON.stringify(jsonBody, null, 2)

  if (!res.getHeader('Content-Type')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
  }

  return res.send(body)
}

exports.send = res => {
  res.json = exports.json(res)

  return body => {
    const type = res.getHeader('Content-Type')

    if (!body && !type) {
      body = {
        [res.statusCode >= 400 ? 'error' : 'data']: exports.statuses.get(res.statusCode).description
      }
    }

    if (Buffer.isBuffer(body)) {
      res.setHeader('Content-Type', type || 'application/octet-stream')
      res.setHeader('Content-Length', body.length)
      return res.end(body)
    }

    if (isStream.readable(body)) {
      res.setHeader('Content-Type', type || 'application/octet-stream')
      return body.pipe(res)
    }

    if (typeof body === 'object' && !type) {
      return res.json(body)
    }

    res.setHeader('Content-Length', body ? Buffer.byteLength(body) : 0)
    res.end(body)
  }
}

exports.status = res => statusCode => {
  res.statusCode = statusCode
  return res
}

exports.handler = next => (req, res, app) => {
  res.send = exports.send(res)
  res.status = exports.status(res)
  res.setHeaders = headers => Object.entries(headers).forEach(([header, value]) => res.setHeader(header, value))

  for (const [code, { short }] of exports.statuses.entries()) {
    res[short] = data => res.status(code).send(data)
  }

  next(req, res, app)
}
