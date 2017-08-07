// Nautilus
// ==
// The purpose of Nautilus is to provide a basic structure promoting convention
// over configuration and allowing for both better long term maintainability
// and the rapid prototyping of new apps. This module contains the core
// functionality and module loader and should likely not be used by itself
// unless you know what you're doing!
const EventEmitter = require('events');
const path = require('path');
const stack = require('callsite');

class Nautilus {
  /**
   * The core functionality of Nautilus is centered around the application and
   * configuration objects. As hooks are dynamically loaded each one is invoked
   * with the current state of the application allowing for it to be dynamically
   * built layer by layer.
   * @param {Object} app The core object used to build the application.
   * @param {Object} config At-launch configuration which overrides all other
   * layers of configuration including environment and local configurations.
   */
  constructor(app, config) {
    this.app = app || {};

    // Allow the user to override the configuration set by the application. Any
    // values provided to the constructor will override both environment and
    // local configuration settings.
    this.app.runtimeConfig = config || {};

    // The application path is set to the current working directory of the
    // parent process. This allows for relative paths to be resolved in order to
    // render views, read configuration, etc.
    this.app.appPath = this.app.appPath || this.app.runtimeConfig.appPath || process.cwd();
    this.app.frameworkPath = path.dirname(stack()[1].getFileName());

    // Populate the configuration with a reference to the parent `package.json`.
    // This can be used to check version dependencies or get basic metadata
    // about the project by accessing `app.config.self`.
    try {
      const packagePath = path.resolve(this.app.appPath, 'package.json');
      this.app.runtimeConfig.self = require(packagePath);
    } catch (err) {}

    this.app.Loader = require('./lib/loader.js');

    // Configuration and logging are initialized first before all others.
    require('./lib/config')(this.app);
    require('./lib/log')(this.app);
    require('./lib/hooks')(this.app);

    this.app.events = new EventEmitter();

    // An asynchronous bootstrap function is run immediately after Nautilus core
    // is initialized. This allows for special logic before additional hooks are
    // loaded from the parent framework or end-user application.
    if (this.app.config.bootstrap) {
      this.app.config.bootstrap(this.app);
    }
  }
}

module.exports = Nautilus;
