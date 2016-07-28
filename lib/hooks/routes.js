// Routes
// ======
// Routes allow you to create basic routing or alias existing controllers.
// You should not use routes for complex logic, these should go in controllers.
// However, if you simply need to render a view or provide a shortcut to a route
// defined in an existing controller you can use the functionality here.
const _ = require('lodash');

module.exports = function routesHook(app) {
  if (!app.config.routes) return;

  // Configuration
  // -------------
  // There are three different ways to define routes based on your needs.
  var createRoute = config => {
    // 1. An object with a `view` and `locals` key. This will be called with
    // `res.render` and can be used to render static views or your homepage.
    if (config.view)
      return (req, res) => res.render(config.view, config.locals || {});

    // 2. An object with a `controller` and `action` key. The controller name
    // should correspond to a file in your `api` directory. The action name
    // should match an exported route.
    if (config.controller && config.action) {
      return app.api.controller[config.controller][config.action];
    }
  };

  _.each(app.config.routes, (fn, route) => {
    // 3. A function which accepts a standard Express request and response
    // parameter. While this allows for more complex logic, this should be
    // used sparingly so as not to bloat your `config/routes.js` file.
    if (typeof fn !== 'function') {
      fn = createRoute(fn);
    }

    app.get(route, fn);
  });
};
