const _ = require('lodash')
const mongoose = require('mongoose')
const camelCase = require('camelcase')

const findOrCreate = require('./findOrCreate')

const adapters = ['methods', 'middleware', 'query', 'statics', 'virtuals']

module.exports = app => function NautilusSchemaParser (settings, model) {
  // Allow models to export a function which will be invoked with the `app`
  // object as a single argument. This allows for access to configuration or
  // services from within the schema settings.
  if (typeof settings === 'function') {
    settings = settings(app)
  }

  // When creating the schema in Mongoose, the default collection name matches
  // that of the model (as opposed to the default behavior of pluralizing).
  // This can be overridden in the model settings on the `options` key.
  const options = _.merge({ collection: model }, settings.options)
  const schema = new mongoose.Schema(settings.schema, options)
  schema.plugin(findOrCreate)

  // Support for declaring methods, statics, etc. using the same Object-based
  // format that we configure the Schema with.
  adapters.map(adapter => {
    _.each(settings[adapter], require(`./adapters/${adapter}`)(schema))
  })

  // Additional schema configuration can be done with a `setup` function which
  // takes a single argument for the `schema`. Using this method you can
  // configure virtuals, indexes, query helpers, etc. The `app` object is
  // passed as an optional second parameter to facilitate the use of services
  // or configuration in this function.
  if (settings.setup) {
    settings.setup(schema, app)
  }

  // Each service is exposed on `app.api.model.KEY` for use in other parts of
  // your application.
  const modelName = camelCase(model, { pascalCase: true })
  app.api.model[model] = mongoose.model(modelName, schema)
}
