const { STATUS_CODES } = require('http')

const camelcase = require('camelcase')
const isStream = require('is-stream')

const codes = new Map([
  ...Object.entries(STATUS_CODES).map(([code, verb]) => [parseInt(code), verb]),
  [301, 'Redirect'],
  [420, 'Enhance Your Calm'],
  [500, 'Error']
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
        [res.statusCode >= 400 ? 'error' : 'data']: codes.get(res.statusCode)
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

    res.setHeader('Content-Length', Buffer.byteLength(body))
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

  for (const [statusCode, verb] of codes.entries()) {
    res[camelcase(verb)] = data => res.status(statusCode).send(data)
  }

  next(req, res, app)
}
