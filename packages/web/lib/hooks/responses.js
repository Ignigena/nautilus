// Responses
// ===
// Nautilus is built on top of Express and all responses which are provided by
// Express are supported out of the box. This hook adds some convenience methods
// by which the more common responses can be streamlined.
const { STATUS_CODES } = require('http')
const fs = require('fs')
const path = require('path')

const camelCase = require('camelcase')

const responseCodes = [
  ...Object.entries(STATUS_CODES),
  [301, 'Moved Permanently'],
  [420, 'Slow Your Roll'],
  [500, 'Server Error']
]

module.exports = function responsesHook (app) {
  // This object is populated once the Views hook loads.
  const viewPaths = {}
  this.responsePath = view => {
    view = `responses/${view}.${app.get('view engine')}`
    return path.resolve(app.get('views'), view)
  }

  // All JSON responses are returned formatted to help your API be more
  // pleasant to use. The cost of the extra data transfer is negligible when
  // gzip is properly implemented.
  app.set('json spaces', 2)

  // Before adding the convenience methods, we check for the existence of a
  // corresponding view for error responses. These can be placed in your views
  // directory in a `responses/` subdirectory.
  app.hooks.after('core:views', () => {
    for (let i = 0; i < responseCodes.length; i++) {
      const [status, statusText] = responseCodes[i]
      const path = this.responsePath(statusText)
      fs.access(path, fs.R_OK, err => {
        if (err) return
        viewPaths[status] = path
      })
    }
  })

  // All status codes are made available as response helpers. For a full list of
  // implemented codes, see https://www.npmjs.com/package/http-status-codes
  // All response types use their camel-case equivelant. For example, to send a
  // `200 - OK` response from your API you can simply write
  // `res.ok('hello world')`. Or you can send a `404 - Not Found` with
  // `res.notFound('these are not the droids')`.
  for (let i = 0; i < responseCodes.length; i++) {
    const [status, statusText] = responseCodes[i]
    const short = camelCase(statusText)
    app.response[short] = function (body) {
      this.status(status)
      if (!body) body = statusText
      if (viewPaths[status]) return this.negotiate(viewPaths[status], body)
      this.negotiate(body)
    }
  }

  // res.negotiate()
  // --
  // Determine the type of reponse that should be sent and do this. An explicit
  // view can be provided if HTML responses should be allowed, otherwise the
  // body will be sent as either JSON or plain TXT depending on the request.
  app.response.negotiate = function (view, body) {
    // If a single parameter is passed treat this as the body.
    body = body || view

    // Always send JSON responses if the data being sent is an object and a
    // server-side view is not being used.
    if (body === view && typeof body === 'object') {
      return this.json(body)
    }

    let bodyObject = body

    // Allow a string to be passed as body but convert it to an object. This
    // ensures that both the view and JSON renderer provide an expected response
    // while still leaving a fallback for requests wanting plain text.
    if (typeof body === 'string') {
      bodyObject = {}
      bodyObject[this.statusCode > 400 ? 'error' : 'body'] = body
    }

    this.format({
      text: () => {
        this.send(body)
      },
      // Respond with HTML if supported. If a view is provided, this uses the
      // Express function `res.render()` with the object version of the body.
      // Otherwise it will perform a `res.send()` with the original body. If the
      // original body is a string the response will be HTML, otherwise it will
      // be sent as JSON anyway.
      html: () => {
        if (body !== view) return this.render(view, bodyObject)
        this.send(body)
      },
      // Prefer JSON responses if acceptable.
      json: () => this.json(bodyObject),
      default: () => this.send(body)
    })
  }
}
