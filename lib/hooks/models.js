// Models
// ======
// Models are constructed through [Mongoose](http://mongoosejs.com) which also
// provides an ORM out of the box. Model definitions can be placed in the `/api`
// directory and must have the suffix `.model.js`. Model schema can be
// configured with the `schema` object and an optional `options` object.
const _ = require('lodash');
const changeCase = require('change-case');
const findOrCreate = require('mongoose-findorcreate');
const mongoose = require('mongoose');

module.exports = NautilusCoreORMHook;

// ORM
// --
function NautilusCoreORMHook(app) {
  app.api = app.api || {};
  app.api.model = require('../util/loadApi')(app.appPath, 'model');

  if (!app.config.connections || !app.config.connections.mongo) {
    app.log.warn('No Mongo connection configured, add one in `config/connections.js`');
    return;
  }
  NautilusCoreConnect(app);

  // Each model schema is initilized in Mongoose and then added as a global for
  // convenience in other parts of the application.
  _.each(app.api.model, function(settings, model) {
    var modelName = changeCase.pascal(model);
    // When creating the schema in Mongoose, the default collection name matches
    // that of the model (as opposed to the default behavior of pluralizing).
    // This can be overridden in the model settings on the `options` key.
    var schema = new mongoose.Schema(settings.schema, _.merge({ collection: model }, settings.options));
    schema.plugin(findOrCreate);

    // Additional schema configuration can be done with a `setup` function which
    // takes a single argument for the `schema`. Using this method you can
    // configure virtuals, indexes, query helpers, etc.
    if (settings.setup) {
      settings.setup(schema);
    }

    // Each model name is transformed to PascalCase and available globally for
    // convenient use in other parts of the application without require chains.
    app.api.model[model] = global[modelName] = mongoose.model(modelName, schema);
  });
}

NautilusCoreORMHook.prototype.order = -1;

// Connect
// --
function NautilusCoreConnect(app) {
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
