const bodyParser = require('body-parser');

module.exports = function NautilusWebMiddleware(app) {
  // Core Middleware
  // --
  app.use(require('../middleware/headers'));
  app.use(require('../middleware/slash')(app));

  app.use(bodyParser.json());

  // Custom Middleware
  // --
  // Custom middleware can be placed inside your applications `middleware`
  // directory. These function just like hooks and expose the application and
  // server instance to your exported function. However, for simplicities sake
  // you can simply export your middleware function and `app.use` will be called
  // automatically when it's loaded.
  app.events.on('hooks:loaded:middleware', (hook, hookReturn) => {
    if (typeof hookReturn === 'function') {
      app.use(hookReturn);
    }
  });

  app.events.once('ready', () =>
    app.events.removeAllListeners('hooks:loaded:middleware'));

  app.hooks.load('custom', 'middleware', this.server);
};
