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
    if (viewPaths[400]) return this.view(viewPaths[400], body);
    this.send(body);
  };

  // res.created()
  // --
  // Sends a 201 "Created" response to the client indicating the request has
  // been fulfilled and a new resource is created.
  app.response.created = function(body) {
    this.status(201).send(body);
  };

  // res.forbidden()
  // --
  // Sends a 403 "Forbidden" response to the client indicating the server
  // understood the request, but is refusing to fulfill it.
  app.response.forbidden = function(body) {
    this.status(403);
    if (viewPaths[403]) return this.view(viewPaths[403], body);
    this.send(body);
  };

  // res.notFound()
  // --
  // Sends a 404 "Not Found" response to the client indicating the server has
  // not found anything matching the requested resource URI.
  app.response.notFound = function(body) {
    this.status(404);
    if (viewPaths[404]) return this.view(viewPaths[404], body);
    this.send(body);
  };

  // res.ok()
  // --
  // Sends a 200 "OK" response to the client indicating the request has
  // succeeded.
  app.response.ok = function(body) {
    this.status(200).send(body);
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
    if (viewPaths[500]) return this.view(viewPaths[500], body);
    this.send(body);
  };

  // res.view()
  // --
  // This is currently serving as a minimal wrapper around the Express response
  // `res.render()`. The only difference is that if the parameter passed is a
  // string it will convert to an object keyed at `body`.
  app.response.view = function(view, body) {
    if (typeof body === 'string') body = { body };
    this.render(view, body);
  };

};
