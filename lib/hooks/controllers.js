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
    // changed, simply add a `router` key to the `config.api.controller` setting
    // corresponding to the controller name.
    var controllerRoute = controller;
    if (app.config.api && app.config.api.controller && app.config.api.controller[controller]) {
      controllerRoute = app.config.api.controller[controller].route || controller;
    }

    // Routing
    // --
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
      var router = new express.Router();
      actions = actions(router, app);
      app.use(`/${controllerRoute}`, router);

      // You can also returned a keyed object with `GET` routes if using this
      // method. This allows for getting access to the router and app objects
      // while still being able to utilize the convenience methods.
      if (!actions) return;
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
    _.each(actions, (fn, action) => {
      app.api.controller[controller][action] = fn;
      if (action === 'index') {
        app.get(`/${controllerRoute}`, fn);
        return;
      }
      app.get(`/${controllerRoute}/${action}/:id?`, fn);
    });

    // You can also combine both methods 1 and 2 as needed. This is particularly
    // helpful when code in your controller needs access to the `app` object but
    // your routes don't need the complexity of binding to a router.
  });

};
