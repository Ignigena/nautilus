// Services
// ========
// Business logic to be used in controllers.
const _ = require('lodash');

module.exports = function servicesHook(app) {
  app.api.service = new app.Loader(app.api.path, '.service.js').all();

  // Each service is exposed on `app.api.service.KEY` for use in other parts of
  // your application.
  _.each(app.api.service, function(service, serviceName) {
    app.log.warn('Services will be deprecated in a future release. Use hooks.');
    // A service can be exported as a function which will get invoked at launch
    // with the application instance. This can be useful for configuration at
    // runtime. It should still return an object of properties for consuming.
    if (typeof service === 'function') {
      app.api.service[serviceName] = service(app);
    }
  });
};
