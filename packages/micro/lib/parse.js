const { parse: parseContentType } = require('content-type')
const { parse: parseCookies } = require('cookie')

exports.parseBody = async (req) => {
  if (!req.headers['content-type']) return undefined

  const body = await new Promise(resolve => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
  })

  switch (parseContentType(req.headers['content-type']).type) {
    case 'application/json':
      try {
        return JSON.parse(body.toString())
      } catch (err) {
        return undefined
      }

    case 'application/x-www-form-urlencoded':
      return Object.fromEntries(new URLSearchParams(body.toString()))

    default:
      return body
  }
}

exports.handler = next => async (req, res, app) => {
  req.body = req.body || await exports.parseBody(req)
  req.cookies = parseCookies(req.headers.cookie || '')
  req.query = Object.assign(
    req.query || {},
    Object.fromEntries(new URL(req.url, `http://${req.headers.host}`).searchParams)
  )

  next(req, res, app)
}
