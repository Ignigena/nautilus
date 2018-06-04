const mongoose = require('mongoose');

module.exports = function NautilusCoreConnect(app) {
  mongoose.Promise = global.Promise;

  mongoose.connection.once('connected', () => {
    app.log.verbose('Mongo connection opened');
  });

  mongoose.connection.once('error', err => {
    app.log.error('Mongo error', err);
    process.exit(1);
  });

  mongoose.connection.once('disconnected', () => {
    app.log.verbose('Mongo connection terminated');
    mongoose.connection.removeAllListeners();
  });

  const url = app.config.connections.mongo.url;
  const options = app.config.connections.mongo.options;
  mongoose.connect(url, options, err => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
  }).catch(err => {
    app.log.error(err);
    process.exit(1);
  });

  app.mongo = mongoose;

  // Be a good citizen and clean up event listeners when the server shuts down.
  app.server.on('close', () => mongoose.disconnect());
};
