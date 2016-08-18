// Responses
// ===
// Nautilus is built on top of Express and all responses which are provided by
// Express are supported out of the box. This hook adds some convenience methods
// by which the more common responses can be streamlined.
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

module.exports = function responsesHook(app) {

  // This object is populated once the Views hook loads.
  var viewPaths = {};
  this.responsePath = view => path.resolve(app.get('views'), `responses/${view}.${app.get('view engine')}`);

  // Before adding the convenience methods, we check for the existence of a
  // corresponding view for error responses. These can be placed in your views
  // directory in a `responses/` subdirectory.
  app.events.on('hooks:loaded:views', () => {
    viewPaths = {
      400: this.responsePath('badRequest'),
      403: this.responsePath('forbidden'),
      404: this.responsePath('notFound'),
      500: this.responsePath('serverError')
    };

    // Validate each of the view paths at launch. If one doesn't exist it is
    // removed entirely from the available options.
    _.each(viewPaths, (view, responseCode) => {
      fs.access(view, fs.R_OK, err => {
        if (err) delete viewPaths[responseCode];
      });
    });
  });

  // res.badRequest()
  // --
  // Sends a 400 "Bad Request" response to the client indicating that the
  // request is invalid.
  app.response.badRequest = function(body) {
    this.status(400);
    if (viewPaths[400]) return this.negotiate(viewPaths[400], body);
    this.negotiate(body);
  };

  // res.created()
  // --
  // Sends a 201 "Created" response to the client indicating the request has
  // been fulfilled and a new resource is created.
  app.response.created = function(body) {
    this.status(201).negotiate(body);
  };

  // res.forbidden()
  // --
  // Sends a 403 "Forbidden" response to the client indicating the server
  // understood the request, but is refusing to fulfill it.
  app.response.forbidden = function(body) {
    this.status(403);
    if (viewPaths[403]) return this.negotiate(viewPaths[403], body);
    this.negotiate(body);
  };

  // res.notFound()
  // --
  // Sends a 404 "Not Found" response to the client indicating the server has
  // not found anything matching the requested resource URI.
  app.response.notFound = function(body) {
    this.status(404);
    if (viewPaths[404]) return this.negotiate(viewPaths[404], body);
    this.negotiate(body);
  };

  // res.ok()
  // --
  // Sends a 200 "OK" response to the client indicating the request has
  // succeeded.
  app.response.ok = function(body) {
    this.status(200).negotiate(body);
  };

  // res.redirect()
  // --
  // Sends either a 301 "Moved Permanent" or 302 "Found" response to the client
  // indicating the resource has moved to a different URL. In most situations
  // a permanent redirect is sufficient and this is the default behavior.
  app.response.redirect = function(address, temporary) {
    this.set('Location', address);
    this.status(temporary ? 302 : 301).send();
  };

  // res.serverError()
  // --
  // Sends a 500 "Internal Server Error" response to the client indicating the
  // server encountered an unexpected condition which prevented it from
  // fulfilling the request.
  app.response.serverError = function(body) {
    this.status(500);
    if (viewPaths[500]) return this.negotiate(viewPaths[500], body);
    this.negotiate(body);
  };

  // res.negotiate()
  // --
  // Determine the type of reponse that should be sent and do this. An explicit
  // view can be provided if HTML responses should be allowed, otherwise the
  // body will be sent as either JSON or plain TXT depending on the request.
  app.response.negotiate = function(view, body) {
    // If a single parameter is passed treat this as the body.
    body = body || view;
    var bodyObject = body;

    // Allow a string to be passed as body but convert it to an object. This
    // ensures that both the view and JSON renderer provide an expected response
    // while still leaving a fallback for requests wanting plain text.
    if (typeof body === 'string') {
      bodyObject = {};
      bodyObject[this.statusCode > 400 ? 'error' : 'body'] = body;
    }

    this.format({
      text: () => this.send(body),
      // Respond with HTML if supported. If a view is provided, this will use the
      // Express function `res.render()` with the object version of the body.
      // Otherwise it will perform a `res.send()` with the original body. If the
      // original body is a string the response will be HTML, otherwise it will
      // be sent as JSON anyway.
      html: () => {
        if (body !== view) return this.render(view, bodyObject);
        this.send(body);
      },
      // Prefer JSON responses if acceptable.
      json: () => this.send(bodyObject),
      default: () => this.send(body)
    });
  };

};
