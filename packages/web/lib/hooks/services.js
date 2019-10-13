// Services
// ========
// Business logic to be used in controllers.
module.exports = function servicesHook (app) {
  const services = new app.Loader(app.api.path, '.service.js').all()

  // Each service is exposed on `app.api.KEY` for use in other parts of your
  // application. Services are equivelant to hooks, but can be useful to keep
  // controllers and their services next to each other in the file system.
  app.api = {
    ...app.api,
    ...Object.entries(services).reduce((services, [name, service]) => {
      services[name] = typeof service === 'function' ? service(app) : service
      return services
    }, {})
  }
}
