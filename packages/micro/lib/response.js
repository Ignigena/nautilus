const { STATUS_CODES } = require('http')

const camelcase = require('camelcase')
const { send } = require('micro')

const codes = [
  ...Object.entries(STATUS_CODES),
  ['301', 'Redirect'],
  ['420', 'Enhance Your Calm'],
  ['500', 'Error']
]

exports.send = res => body => {
  res.statusCode = res.statusCode || 200

  if (typeof message !== 'object' && !res.getHeader('Content-Type')) {
    body = { [res.statusCode >= 400 ? 'error' : 'data']: body }
  }

  return send(res, res.statusCode, body)
}

exports.status = res => statusCode => {
  res.statusCode = statusCode
  return res
}

exports.handler = next => (req, res, app) => {
  res.send = exports.send(res)
  res.status = exports.status(res)

  codes.forEach(([statusCode, verb]) => {
    res[camelcase(verb)] = data => res.status(statusCode).send(data || verb)
  })

  next(req, res, app)
}
