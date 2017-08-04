// Responses
// ===
// Nautilus is built on top of Express and all responses which are provided by
// Express are supported out of the box. This hook adds some convenience methods
// by which the more common responses can be streamlined.
const _ = require('lodash');
const changeCase = require('change-case');
const fs = require('fs');
const httpStatusCodes = require('http-status-codes');
const path = require('path');

module.exports = function responsesHook(app) {
  // This object is populated once the Views hook loads.
  let viewPaths = {};
  this.responsePath = view => {
    view = `responses/${view}.${app.get('view engine')}`;
    return path.resolve(app.get('views'), view);
  };

  // All JSON responses are returned formatted to help your API be more
  // pleasant to use. The cost of the extra data transfer is negligible when
  // gzip is properly implemented.
  app.set('json spaces', 2);

  // Before adding the convenience methods, we check for the existence of a
  // corresponding view for error responses. These can be placed in your views
  // directory in a `responses/` subdirectory.
  app.hooks.after('core:views', () => {
    viewPaths = {
      400: this.responsePath('badRequest'),
      401: this.responsePath('unauthorized'),
      403: this.responsePath('forbidden'),
      404: this.responsePath('notFound'),
      500: this.responsePath('serverError'),
    };

    // Validate each of the view paths at launch. If one doesn't exist it is
    // removed entirely from the available options.
    _.each(viewPaths, (view, responseCode) => {
      fs.access(view, fs.R_OK, err => {
        if (err) delete viewPaths[responseCode];
      });
    });
  });

  // All status codes are made available as response helpers. For a full list of
  // implemented codes, see https://www.npmjs.com/package/http-status-codes
  // All response types use their camel-case equivelant. For example, to send a
  // `200 - OK` response from your API you can simply write
  // `res.ok('hello world')`. Or you can send a `404 - Not Found` with
  // `res.notFound('these are not the droids')`.
  _.each(httpStatusCodes, status => {
    if (typeof status !== 'number') return;

    let statusText = httpStatusCodes.getStatusText(status);
    let short = changeCase.camelCase(statusText);
    app.response[short] = function(body) {
      this.status(status);
      if (!body) body = statusText;
      if (viewPaths[status]) return this.negotiate(viewPaths[status], body);
      this.negotiate(body);
    };
  });

  // res.redirect()
  // --
  // In addition to `res.movedPermanently()` and `res.movedTemporarily()`, this
  // helper is available. Sends either a 301 "Moved Permanently" or 302 "Moved
  // Temporarily" response to the client indicating the resource has moved to a
  // different URL. In most situations a permanent redirect is sufficient and
  // this is the default behavior.
  app.response.redirect = function(address, temporary) {
    this.set('Location', address);
    this.status(temporary ? 302 : 301).send();
  };

  // res.negotiate()
  // --
  // Determine the type of reponse that should be sent and do this. An explicit
  // view can be provided if HTML responses should be allowed, otherwise the
  // body will be sent as either JSON or plain TXT depending on the request.
  app.response.negotiate = function(view, body) {
    // If a single parameter is passed treat this as the body.
    body = body || view;
    let bodyObject = body;

    // Allow a string to be passed as body but convert it to an object. This
    // ensures that both the view and JSON renderer provide an expected response
    // while still leaving a fallback for requests wanting plain text.
    if (typeof body === 'string') {
      bodyObject = {};
      bodyObject[this.statusCode > 400 ? 'error' : 'body'] = body;
    }

    this.format({
      text: () => {
        this[typeof body === 'object' ? 'send' : 'json'](body);
      },
      // Respond with HTML if supported. If a view is provided, this uses the
      // Express function `res.render()` with the object version of the body.
      // Otherwise it will perform a `res.send()` with the original body. If the
      // original body is a string the response will be HTML, otherwise it will
      // be sent as JSON anyway.
      html: () => {
        if (body !== view) return this.render(view, bodyObject);
        this[typeof body === 'object' ? 'send' : 'json'](body);
      },
      // Prefer JSON responses if acceptable.
      json: () => this.json(bodyObject),
      default: () => this.send(body),
    });
  };
};
