// Controllers
// ===========
// Routing and logic in your application.
const _ = require('lodash');
const express = require('express');

module.exports = function controllersHook(app) {
  app.api = app.api || {};
  try {
    app.api.controller = require('../util/loadApi')(app.appPath, 'controller');
  } catch (e) {
    app.log.error(e);
    app.api.controller = {};
    return;
  }

  // Configuration
  // -------------
  // There are two ways to define routes in a controller based on how much
  // flexibility you need out of your application logic. You can mix and match
  // styles between controllers without issue:
  //
  //  1. Export a function which takes up to two parameters. This function will
  //     be invoked with both an Express router and the application itself.
  //
  //  2. Export an object with a single parameter for each route. Each key will
  //     be used to create a new GET route with an optional ID parameter.
  //
  // Each route will be prefixed with the name of the controller.
  _.each(app.api.controller, function(actions, controller) {
    // Configuration
    // --
    // In most cases, the default behavior of using the controller name as the
    // router prefix should be used for clarity purposes. If this needs to be
    // changed, simply add a `router` key to the `config.api` setting
    // corresponding to the controller name.
    let controllerRoute = controller;
    if (app.config.api && app.config.api[controller]) {
      controllerRoute = app.config.api[controller].route || controller;
    }

    // Routing
    // --
    let router = new express.Router();
    // **Method #1**: exposes the full router and app object for ultimate
    // flexibility. The following placed in `/api/world/world.controller.js`
    // will serve requests at `/world/hello`.
    // ```
    // module.exports = (router, app) => {
    //   router.get('/hello', (req, res) => {
    //     res.send('hello world');
    //   });
    // };
    // ```
    if (typeof actions === 'function') {
      actions = actions(router, app);

      // You can also returned a keyed object with `GET` routes if using this
      // method. This allows for getting access to the router and app objects
      // while still being able to utilize the convenience methods.
      if (!actions) {
        app.use(`/${controllerRoute}`, router);
        return;
      }
    }

    // **Method #2**: creates a GET route with an optional ID parameter. The
    // following code placed in `/api/world/world.controller.js` will serve
    // requests at both `/world/hello` and `/world/hello/123`.
    // ```
    // module.exports = {
    //   hello: (req, res) => {
    //     res.send(`hello world ${req.param('id')}`);
    //   },
    // };
    // ```
    let routes = Object.keys(actions);
    if (routes.indexOf('index') >= 0) {
      routes.splice(routes.indexOf('index'), 1);
      routes.push('index');
    }

    _.each(routes, route => {
      // Prevent routes from being created for blueprint actions.
      if (['find', 'findOne', 'create', 'update', 'delete'].indexOf(route) >= 0)
        return;

      fn = actions[route];
      app.api.controller[controller][route] = fn;
      require('../util/createRoute')(route, fn, router);
    });

    // You can also combine both methods 1 and 2 as needed. This is particularly
    // helpful when code in your controller needs access to the `app` object but
    // your routes don't need the complexity of binding to a router.
    app.use(`/${controllerRoute}`, router);
  });
};
