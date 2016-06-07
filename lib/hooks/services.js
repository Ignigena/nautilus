// Services
// ========
// Business logic to be used in controllers.
const _ = require('lodash');
const changeCase = require('change-case');

module.exports = function servicesHook(app) {
  app.api = app.api || {};
  try {
    app.api.service = require('../util/loadApi')(app.appPath, 'service');
  } catch (e) {
    app.log.error(e);
    app.api.service = {};
    return;
  }

  // Each service is exposed both on `app.api.service.KEY` as well as a global
  // exposed in PascalCase for convenient use in other parts of the application.
  _.each(app.api.service, function(service, serviceName) {
    // A service can be exported as a function which will get invoked at launch
    // with the application instance. This can be useful for configuration at
    // runtime. It should still return an object of properties for consuming.
    if (typeof service === 'function') {
      app.api.service[serviceName] = service(app);
    }
    global[`${changeCase.pascal(serviceName)}Service`] = app.api.service[serviceName];
  });
};
