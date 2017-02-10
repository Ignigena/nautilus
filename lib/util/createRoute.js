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
  router.use(`/${action}/:id?`, fn);
};
