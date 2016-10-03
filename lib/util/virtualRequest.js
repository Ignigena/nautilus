'use strict';
const mock = require('node-mocks-http');
const jsonpack = require('jsonpack');

// Used to send virtual requests to the Express server over WebSockets.
class VirtualRequest {

  constructor(app, compressed) {
    this.app = app;
    this.compressed = compressed;
  }

  make(url, method, headers) {
    var request = mock.createRequest({
      method: method || 'GET',
      url,
      headers
    });

    var response = mock.createResponse({
      eventEmitter: require('events').EventEmitter
    });

    return new Promise((resolve, reject) => {
      response.on('end', () => resolve(this.respond(response._getData())));
      this.app.handle(request, response);
    });
  }

  respond(data) {
    data = JSON.stringify(data);
    if (!this.compressed) return data;

    return jsonpack.pack(data);
  }

}

module.exports = VirtualRequest;
