// Nautilus
// ========
// The purpose of Nautilus is to provide a basic structure around Express to
// allow for better team maintainability and rapid prototyping of new apps.
'use strict';
const express = require('express');
const fs = require('fs');
const http = require('http');
const requireAll = require('require-all');

class Nautilus {

  constructor(config) {
    this.app = express();
    this.server = new http.Server(this.app);

    // Allow the user to override the configuration set by the application. Any
    // values provided to the constructor will override both environment and
    // local configuration settings.
    this.app.runtimeConfig = config;

    // The application path is set to the current working directory of the parent
    // process. This allows for relative paths to be resolved in order to render
    // views, read configuration, etc.
    this.app.appPath = process.cwd();

    // Configuration and logging are initialized first before all others.
    require('./lib/core/config')(this.app);
    require('./lib/core/logs')(this.app);
    require('./lib/core/events')(this.app);

    // The middleware component adds default Session and Security middleware.
    this.app.log.profile('middleware');
    require('./lib/core/middleware')(this.app);
    this.app.log.profile('middleware');

    require('./lib/core/session')(this.app);

    this.loadHooks('custom', 'middleware');

    this.loadHooks('core');

    // Once all core hooks are loaded, we connect to Mongo through Mongoose.
    this.app.log.profile('connect');
    require('./lib/core/connect')(this.app);
    this.app.log.profile('connect');

    this.loadHooks('custom');

    // The port number can be overridden by passing a `PORT` environment variable to
    // the Node process. This is done automatically by some hosts such as Heroku.
    this.app.set('port', process.env.PORT || 3000);
  }

  // All core Nautilus hooks are looped through and initialized. Both the
  // Express application and the attached HTTP server are passed along to each
  // hook to allow the application to be extended before traffic is served.
  loadHooks(type, location) {
    location = location || 'hooks';
    this.app.log.profile(`${type} ${location}`);
    this.app.log.verbose(`Initializing ${type} ${location}...`);
    var hookPath = type === 'core' ? `${__dirname}/lib/${location}` : `${this.app.appPath}/${location}`;
    if (fs.existsSync(hookPath)) {
      requireAll({
        dirname: hookPath,
        map: name => {
          this.app.log.verbose(`  ├ ${name}`);
          return name;
        },
        resolve: config => {
          config(this.app, this.server);

          // Each hook, both core and custom, will emit an event when it has
          // finished loading. To take advantage of this make sure your custom
          // hooks are registered with a function name.
          if (config.prototype && config.prototype.constructor.name) {
            var hookName = config.prototype.constructor.name;
            this.app.events.emit(`hooks:loaded:${hookName.replace('Hook', '')}`);
          }
        }
      });
      this.app.log.verbose('  └ done!');
    }
    this.app.log.profile(`${type} ${location}`);
  }

  // Once you're ready to `.start()` the server:
  // ```
  // const nautilus = require('nautilus');
  // var myApp = new Nautilus();
  // // Custom configuration here.
  // myApp.start();
  // ```
  start(cb) {
    // Globally intercept 404 errors and return a `res.notFound` rather than the
    // default Express 404 page. This allows a view to be used when added to
    // your views directory at `responses/404.jts`.
    this.app.use(require('./lib/middleware/notFound'));

    try {
      this.server.listen(this.app.get('port'), () => {
        this.app.log.info();
        this.app.log.info(`Server running on port ${this.server.address().port} in ${this.app.get('env')} mode.`);
        this.app.log.info('To shut down press <CTRL> + C at any time.');
        this.app.log.info();

        if (!cb) return;
        if (!this.app.config.waitForReady) return cb(null, this.server);

        // If the launch of the server involves asynchronous activities it may
        // be helpful to enable `waitForReady` in your `app.config` settings.
        // Once all asynchronous activies have been completed, simply call
        // `app.events.emit('ready');` and your callback will fire. This can be
        // useful when testing asynchronous hooks. If you need to delay binding
        // to port see `.startWhenReady()` below.
        this.app.events.on('ready', () => cb(null, this.server));
      });
    } catch (err) {
      cb(err);
    }
    return this.app;
  }

  // This is the functional equivelant to adding `waitForReady` in your
  // `app.config` settings. The primary difference here is that the server will
  // not bind to port before the "ready" event is emitted. This can be useful
  // when deploying to Heroku and utilizing the Preboot setting. Make sure you
  // emit a "ready" event by calling `app.events.emit('ready');` in one of your
  // hooks otherwise the server will never bind to port!
  startWhenReady(cb) {
    this.app.events.on('ready', () => this.start(cb));
  }

}

module.exports = Nautilus;
