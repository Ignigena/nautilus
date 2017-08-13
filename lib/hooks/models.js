// Models
// ======
// Models are constructed through [Mongoose](http://mongoosejs.com) which also
// provides an ORM out of the box. Model definitions can be placed in the `/api`
// directory and must have the suffix `.model.js`. Model schema can be
// configured with the `schema` object and an optional `options` object.
const _ = require('lodash');
const findOrCreate = require('mongoose-findorcreate');
const mongoose = require('mongoose');
const pascalCase = require('pascal-case');

module.exports = NautilusCoreORMHook;

// ORM
// --
function NautilusCoreORMHook(app) {
  app.api.model = new app.Loader(app.api.path, '.model.js').all();
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
    let modelName = pascalCase(model);

    // Allow models to export a function which will be invoked with the `app`
    // object as a single argument. This allows for access to configuration or
    // services from within the schema settings.
    if (typeof settings === 'function') {
      settings = settings(app);
    }

    // When creating the schema in Mongoose, the default collection name matches
    // that of the model (as opposed to the default behavior of pluralizing).
    // This can be overridden in the model settings on the `options` key.
    let options = _.merge({ collection: model }, settings.options);
    let schema = new mongoose.Schema(settings.schema, options);
    schema.plugin(findOrCreate);

    // Virtuals can be defined on the `virtual` property of the model.
    _.each(settings.virtuals, function(virtual, virtualName) {
      // If an object is returned, this is used as the virtual configuration.
      if (typeof virtual === 'object') {
        schema.virtual(virtualName, virtual);
        return;
      }

      // If only a getter is needed a single function can be passed. Otherwise,
      // a `set` and `get` key can be specified with their respective functions.
      if (typeof virtual === 'function') {
        virtual = { get: virtual };
      }
      _.each(virtual, function(func, type) {
        schema.virtual(virtualName)[type](func);
      });
    });

    // Middleware can be defined on the `middleware` property of the model. Each
    // hook type can be written in camel case and can be passed either a single
    // function or an array of functions.
    _.each(settings.middleware, function(hook, type) {
      let hookDetails = new RegExp(/(pre|post)(.*)/g).exec(type);
      let when = hookDetails[1];
      let what = hookDetails[2].charAt(0).toLowerCase() + hookDetails[2].slice(1);

      if (typeof hook !== 'array') {
        hook = [hook];
      }

      _.each(hook, function(middleware) {
        schema[when](what, middleware);
      });
    });

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
}
