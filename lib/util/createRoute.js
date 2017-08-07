module.exports = function createRoute(action, fn, router) {
  // Allow the main route to be defined with the `index` key.
  if (action === 'index') {
    router.get('/:id?', fn);
    return;
  }

  // To define a route via regex append the regular expression with `r|`.
  if (action.indexOf('r|') === 0) {
    router.get(new RegExp(action.replace('r|', '')), fn);
    return;
  }

  // Otherwise, a route is created with an optional `id` parameter.
  if (action.indexOf('/') === 0) action = action.substring(1);

  // If an object is supplied to this function, it is assumed to provide
  // specific supported methods and their responses.
  let routeFn = typeof fn === 'function' && fn || function(route) {
    return (req, res) => {
      let method = req.method.toLowerCase();
      if (!route[method] && !route.fn) return res.badRequest();

      if (route.validate) {
        let result = req.validate(route.validate);
        if (!result.isValid) {
          res.badRequest(`${result.validation} failed for ${result.param}`);
          return;
        }
      }

      route[method] && route[method](req, res) || route.fn(req, res);
    };
  }(fn);

  router.use(`/${action}/:id?`, routeFn);
};
