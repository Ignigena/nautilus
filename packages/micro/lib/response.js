const { STATUS_CODES } = require('http')

const camelcase = require('camelcase')
const { send } = require('micro')

const codes = new Map([
  ...Object.entries(STATUS_CODES),
  ['301', 'Redirect'],
  ['420', 'Enhance Your Calm'],
  ['500', 'Error']
])

/**
 * Send a JSON response with correct headers. By default the JSON will be sent
 * with extra spacing to be more human-readable. If a status code has not already
 * been provided, a 200 "OK" status will automatically be used.
 */
exports.json = res => jsonBody => {
  res.statusCode = res.statusCode || 200
  const body = JSON.stringify(jsonBody, null, 2)

  if (!res.getHeader('Content-Type')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
  }

  return res.send(body)
}

exports.send = res => body => {
  res.statusCode = res.statusCode || 200

  if (!body && !res.getHeader('Content-Type')) {
    res.json({ [res.statusCode >= 400 ? 'error' : 'data']: codes.get(res.statusCode) })
  }

  return send(res, res.statusCode, body)
}

exports.status = res => statusCode => {
  res.statusCode = statusCode
  return res
}

exports.handler = next => (req, res, app) => {
  res.json = exports.json(res)
  res.send = exports.send(res)
  res.status = exports.status(res)

  codes.forEach((verb, statusCode) => {
    res[camelcase(verb)] = data =>
      res.status(statusCode)[typeof data === 'object' ? 'json' : 'send'](data)
  })

  next(req, res, app)
}
