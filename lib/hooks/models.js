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
  app.api.model = _.merge(app.api.model, app.config.models);

  if (!app.config.connections.mongo.url) {
    app.log.warn('No Mongo connection configured.');
    app.log.warn('Add one in `config/connections.js` or disable this hook.');
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
    // configure virtuals, indexes, query helpers, etc. The `app` object is
    // passed as an optional second parameter to facilitate the use of services
    // or configuration in this function.
    if (settings.setup) {
      settings.setup(schema, app);
    }

    // Each service is exposed on `app.api.model.KEY` for use in other parts of
    // your application.
    app.api.model[model] = mongoose.model(modelName, schema);
  });

  app.model = function(model) {
    return app.api.model[model];
  };
}

NautilusCoreORMHook.prototype.order = -1;

// Connect
// --
function NautilusCoreConnect(app) {
  mongoose.Promise = global.Promise;

  mongoose.connection.once('connected', () => {
    app.log.verbose('Mongo connection opened');
  });

  mongoose.connection.once('error', err => {
    app.log.error('Mongo error', err);
    process.exit(1);
  });

  mongoose.connection.once('disconnected', () => {
    app.log.info('Mongo connection terminated');
    mongoose.connection.removeAllListeners();
  });

  const url = app.config.connections.mongo.url;
  const options = app.config.connections.mongo.options;
  mongoose.connect(url, options, err => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
  });

  app.mongo = mongoose;

  // Be a good citizen and clean up event listeners when the server shuts down.
  app.server.on('close', () => mongoose.disconnect());
}
