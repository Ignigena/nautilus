const _ = require('lodash')

const routes = require('./routes')

module.exports = NautilusCoreBlueprint

/**
 * The Blueprint hook is useful when rapidly prototyping an application and can
 * handle most of the CRUD logic for a simple RESTful API. It consists of two
 * parts: generic methods that can be used in your own application and basic
 * CRUD routing for each of your models.
 * @param {Nautilus} app
 */
function NautilusCoreBlueprint (app) {
  // These generic methods are used by the CRUD routing to ensure consistent
  // request parsing and response formatting. They can be used in your own app,
  // particularly when over-riding a default CRUD route.
  app.blueprint = {
    find: require('./find')(app),
    format: require('./format')(app),
    update: require('./update')(app)
  }

  // For each model, a RESTful blueprint route is created for basic API
  // scaffolding. You can override any of the default blueprint actions in your
  // own controller or disable the blueprint routes on a per-model basis in
  // your application configuration.
  _.each(app.api.model, function (settings, model) {
    if (app.config.blueprint && app.config.blueprint[model] === false) {
      return
    }

    app.route(`/${model}/:id?`)
      .get(routes.find(app, model))
      .post(routes.create(app, model))
      .put(routes.update(app, model))
      .delete(routes.delete(app, model))
  })
}

NautilusCoreBlueprint.prototype.order = 10
