const _ = require('lodash');
const mongoose = require('mongoose');

module.exports = NautilusCoreConnect;

function NautilusCoreConnect(app) {
  if (!app.config.connections || !app.config.connections.mongo) {
    app.log.warn('No Mongo connection configured, add one in `config/connections.js`');
    return;
  }

  mongoose.Promise = global.Promise;

  mongoose.connection.on('connected', () => {
    app.log.verbose('Mongo connection opened');
  });

  mongoose.connection.on('error', err => {
    app.log.error('Mongo error', err);
    process.exit(1);
  });

  mongoose.connection.on('disconnected', () => {
    app.log.info('Mongo connection terminated');
  });

  mongoose.connect(app.config.connections.mongo.url, _.merge({
    socketOptions: {
      connectionTimeoutMS: 30000,
      keepAlive: 300000
    }
  }, app.config.connections.mongo.options), err => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
  });

}

NautilusCoreConnect.prototype.order = -1;
