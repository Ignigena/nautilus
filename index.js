// Nautilus
// ========
// The purpose of Nautilus is to provide a basic structure around Express to
// allow for better team maintainability and rapid prototyping of new apps.
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

    // The middleware component adds default Session and Security middleware.
    this.app.log.profile('middleware');
    require('./lib/core/middleware')(this.app);
    this.app.log.profile('middleware');

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
  loadHooks(type) {
    this.app.log.profile(`${type} hooks`);
    this.app.log.verbose(`Initializing ${type} hooks...`);
    var hookPath = type === 'core' ? `${__dirname}/lib/hooks` : `${this.app.appPath}/hooks`;
    if (fs.existsSync(hookPath)) {
      requireAll({
        dirname: hookPath,
        map: name => {
          this.app.log.verbose(`  ├ ${name}`);
          return name;
        },
        resolve: config => config(this.app, this.server)
      });
      this.app.log.verbose('  └ done!');
    }
    this.app.log.profile(`${type} hooks`);
  }

  // Once you're ready to `.start()` the server:
  // ```
  // const nautilus = require('nautilus');
  // var myApp = new Nautilus();
  // // Custom configuration here.
  // myApp.start();
  // ```
  start(cb) {
    try {
      this.server.listen(this.app.get('port'), () => {
        this.app.log.info();
        this.app.log.info(`Server running on port ${this.server.address().port} in ${this.app.get('env')} mode.`);
        this.app.log.info('To shut down press <CTRL> + C at any time.');
        this.app.log.info();
        if (cb) cb(null, this.server);
      });
    } catch (err) {
      cb(err);
    }
    return this.app;
  }

}

module.exports = Nautilus;
