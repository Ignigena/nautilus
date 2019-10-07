module.exports = function socketsHook(app, server) {
  app.io = require('socket.io')(server);

  app.io.on('connection', function(socket) {
    app.log.verbose(`socket: new connection [${app.io.engine.clientsCount}]`);

    socket.on('disconnect', function() {
      app.log.verbose(`socket: disconnect [${app.io.engine.clientsCount}]`);
    });
  });
};
