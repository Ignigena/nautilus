const camelCase = require('camelcase')
const schema = require('mongoose-shorthand')

const connect = require('./connect')

module.exports = NautilusCoreORMHook

/**
 * Models are constructed through [Mongoose](http://mongoosejs.com) which also
 * provides an ORM out of the box. Model definitions can be placed in the `/api`
 * directory and must have the suffix `.model.js`. Model schema can be
 * configured with the `schema` object and an optional `options` object.
 * @param {Nautilus} app
 */
function NautilusCoreORMHook (app) {
  const shorthand = schema(app)

  app.api.model = {
    ...new app.Loader(app.api.path, '.model.js').all(),
    ...app.config.models
  }

  if (!app.config.connections.mongo.url) {
    app.log.warn('No Mongo connection configured.')
    app.log.warn('Add one in `config/connections.js` or disable this hook.')
    return
  }

  connect(app)

  // Each flat model schema is parsed into a Mongoose model. All Mongoose
  // functions for this model can be accessed by calling `app.model()` with the
  // name of the model as a string.
  Object.keys(app.api.model).reduce((models, model) => {
    const modelName = camelCase(model, { pascalCase: true })
    models[model] = shorthand(modelName, app.api.model[model])
    return models
  }, app.api.model)

  app.model = model => app.api.model[model]
}

NautilusCoreORMHook.prototype.order = -1
