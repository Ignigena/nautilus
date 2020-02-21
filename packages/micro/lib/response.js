const { STATUS_CODES } = require('http')

const camelcase = require('camelcase')
const { send } = require('micro')

const codes = [
  ...Object.entries(STATUS_CODES),
  ['301', 'Redirect'],
  ['420', 'Enhance Your Calm'],
  ['500', 'Error']
]

function sendStatus (res, statusCode, message) {
  if (typeof message !== 'object') {
    message = { [statusCode >= 400 ? 'error' : 'data']: message }
  }
  send(res, statusCode, message)
}

module.exports = next => (req, res, app) => {
  codes.reduce((response, [statusCode, verb]) => {
    response[camelcase(verb)] = data => sendStatus(res, statusCode, data || verb)
    return response
  }, res)

  next(req, res, app)
}
