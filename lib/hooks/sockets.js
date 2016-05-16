const _ = require('lodash');
const VirtualRequest = require('../util/virtualRequest');

module.exports = function socketsHook(app, server) {
  app.io = require('socket.io')(server);

  app.io.on('connection', function(socket) {
    app.log.verbose(`socket: new connection [${app.io.engine.clientsCount}]`);

    // Allows for API requests to be sent over Sockets. Still very much a WIP.
    socket.on('napi', function(payload) {
      var request = new VirtualRequest(app);
      request.make(payload.url, payload.method || 'GET', _.merge(socket.handshake.headers, payload.headers))
        .then(results => console.log(results));
    });

    socket.on('disconnect', function() {
      app.log.verbose(`socket: disconnect [${app.io.engine.clientsCount}]`);
    });
  });
};
