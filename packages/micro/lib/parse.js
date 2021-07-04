const { json, text } = require('micro')
const { parse: parseContentType } = require('content-type')
const { parse: parseCookies } = require('cookie')
const { parse: parseQS } = require('qs')

exports.parseBody = async (req) => {
  if (!req.headers['content-type']) return undefined

  switch (parseContentType(req.headers['content-type']).type) {
    case 'application/json':
      try {
        return await json(req)
      } catch (err) {
        return undefined
      }

    case 'application/x-www-form-urlencoded':
      return parseQS(await text(req))

    default:
      return text(req)
  }
}

exports.handler = next => async (req, res, app) => {
  req.body = await exports.parseBody(req)
  req.cookies = parseCookies(req.headers.cookie || '')

  next(req, res, app)
}
