// Models
// ======
// Models are constructed through [Mongoose](http://mongoosejs.com) which also
// provides an ORM out of the box. Model definitions can be placed in the `/api`
// directory and must have the suffix `.model.js`. Model schema can be
// configured with the `schema` object and an optional `options` object.
const _ = require('lodash');
const changeCase = require('change-case');
const mongoose = require('mongoose');

module.exports = function ormHook(app) {
  if (!app.config.connections || !app.config.connections.mongo) return;

  app.api = app.api || {};
  app.api.model = require('../util/loadApi')(app.appPath, 'model');

  // Each model schema is initilized in Mongoose and then added as a global for
  // convenience in other parts of the application.
  _.each(app.api.model, function(settings, model) {
    var modelName = changeCase.pascal(model);
    // When creating the schema in Mongoose, the default collection name matches
    // that of the model (as opposed to the default behavior of pluralizing).
    // This can be overridden in the model settings on the `options` key.
    var schema = new mongoose.Schema(settings.schema, _.merge({ collection: model }, settings.options));

    // Each model name is transformed to PascalCase and available globally for
    // convenient use in other parts of the application without require chains.
    app.api.model[model] = global[modelName] = mongoose.model(modelName, schema);
  });
};
