const _ = require('lodash');

const connect = require('./connect');
const schema = require('./schema');

module.exports = NautilusCoreORMHook;

/**
 * Models are constructed through [Mongoose](http://mongoosejs.com) which also
 * provides an ORM out of the box. Model definitions can be placed in the `/api`
 * directory and must have the suffix `.model.js`. Model schema can be
 * configured with the `schema` object and an optional `options` object.
 * @param {Nautilus} app
 */
function NautilusCoreORMHook(app) {
  app.api.model = new app.Loader(app.api.path, '.model.js').all();
  app.api.model = _.merge(app.api.model, app.config.models);

  if (!app.config.connections.mongo.url) {
    app.log.warn('No Mongo connection configured.');
    app.log.warn('Add one in `config/connections.js` or disable this hook.');
    return;
  }

  connect(app);

  // Each model schema is initilized in Mongoose and then added as a global for
  // convenience in other parts of the application.
  let schemaParser = schema(app);
  _.each(app.api.model, schemaParser);

  app.model = model => app.api.model[model];
}

NautilusCoreORMHook.prototype.order = -1;
