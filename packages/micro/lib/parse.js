const { json, text } = require('micro')
const { parse: parseContentType } = require('content-type')
const { parse: parseQS } = require('qs')

module.exports = next => async (req, res, app) => {
  if (!req.headers['content-type']) return next(req, res, app)

  switch (parseContentType(req.headers['content-type']).type) {
    case 'application/json':
      try {
        req.body = await json(req)
      } catch (err) {}
      break

    case 'application/x-www-form-urlencoded':
      req.body = parseQS(await text(req))
      break

    default:
      req.body = text(req)
      break
  }

  next(req, res, app)
}
