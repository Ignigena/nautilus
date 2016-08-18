const mongoose = require('mongoose');

module.exports = NautilusCoreConnect;

function NautilusCoreConnect(app) {
  if (!app.config.connections || !app.config.connections.mongo) {
    app.log.warn('No Mongo connection configured, add one in `config/connections.js`');
    return;
  }
  mongoose.connect(app.config.connections.mongo.url, app.config.connections.mongo.options || {}, err => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
  });
}

NautilusCoreConnect.prototype.order = 99;
