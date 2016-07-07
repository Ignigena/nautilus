// Responses
// ===
// Nautilus is built on top of Express and all responses which are provided by
// Express are supported out of the box. This hook adds some convenience methods
// by which the more common responses can be streamlined.
module.exports = function responsesHook(app) {

  // res.badRequest()
  // --
  // Sends a 400 "Bad Request" response to the client indicating that the
  // request is invalid.
  app.response.badRequest = function(body) {
    this.status(400).send(body);
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
    this.status(403).send(body);
  };

  // res.notFound()
  // --
  // Sends a 404 "Not Found" response to the client indicating the server has
  // not found anything matching the requested resource URI.
  app.response.notFound = function(body) {
    this.status(404).send(body);
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
    this.status(500).send(body);
  };

};
