const { json, text } = require('micro')
const { parse: parseContentType } = require('content-type')
const { parse: parseCookies } = require('cookie')

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
      return Object.fromEntries(new URLSearchParams(await text(req)))

    default:
      return text(req)
  }
}

exports.handler = next => async (req, res, app) => {
  req.body = await exports.parseBody(req)
  req.cookies = parseCookies(req.headers.cookie || '')
  req.query = Object.assign(
    req.query || {},
    Object.fromEntries(new URL(req.url, `http://${req.headers.host}`).searchParams)
  )

  next(req, res, app)
}
