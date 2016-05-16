const _ = require('lodash');

module.exports = function routesHook(app) {
  if (!app.config.routes) return;

  var createRoute = (view, locals) => {
    return (req, res) => res.render(view, locals);
  };

  _.each(app.config.routes, (fn, route) => {
    if (typeof fn !== 'function') {
      fn = createRoute(fn.view, fn.locals);
    }

    app.get(route, fn);
  });
};
