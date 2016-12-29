// Nautilus
// ==
// The purpose of Nautilus is to provide a basic structure promoting convention
// over configuration and allowing for both better long term maintainability
// and the rapid prototyping of new apps.
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const requireAll = require('require-all');
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
    this.app = app;

    // Allow the user to override the configuration set by the application. Any
    // values provided to the constructor will override both environment and
    // local configuration settings.
    this.app.runtimeConfig = config || {};

    // The application path is set to the current working directory of the
    // parent process. This allows for relative paths to be resolved in order to
    // render views, read configuration, etc.
    this.app.appPath = process.cwd();

    // Populate the configuration with a reference to the parent `package.json`.
    // This can be used to check version dependencies or get basic metadata
    // about the project by accessing `app.config.self`.
    try {
      const packagePath = path.resolve(this.app.appPath, 'package.json');
      this.app.runtimeConfig.self = require(packagePath);
    } catch(err) {}

    // Configuration and logging are initialized first before all others.
    require('./lib/core/config')(this.app);
    require('./lib/core/logs')(this.app);
  }

  /**
   * All core Nautilus hooks are looped through and initialized. The application
   * object is passed along to each hook to allow mutable extensions.
   * @param {String} type The type of hook to load (either `core` or `custom`)
   * @param {String} location The location of the hook if a specific one is
   * being requested. Otherwise, leave blank to load all hooks of this type.
   */
  loadHooks(type, location) {
    location = location || 'hooks';
    this.app.profile(`${type} ${location}`);
    this.app.log.verbose(`Initializing ${type} ${location}...`);
    const dirname = {
      core: `${path.dirname(stack()[1].getFileName())}/lib/${location}`,
      custom: `${this.app.appPath}/${location}`,
    }[type];
    if (!fs.existsSync(dirname)) return;

    // The order in which hooks are loaded are determined by the value of their
    // prototype `order`. The default value of any hook is `0`.
    const allHooks = requireAll({ dirname });
    this.app.hooks = _.orderBy(Object.keys(allHooks), hook =>
      allHooks[hook].prototype && allHooks[hook].prototype.order || 0, 'asc');

    _.each(this.app.hooks, hook => {
      // To disable a hook, change it's configuration value to `false` either
      // through the filesystem config or directly when creating the Nautilus
      // instance. This works the same for core and custom hooks.
      if (this.app.config[hook] === false) return;
      this.app.log.verbose(`  ├ ${hook}`);

      allHooks[hook](this.app, this.server);

      // Each hook, both core and custom, will emit an event when it has loaded.
      // For advaned fine-grained control, a hook can wait for any other hook
      // to fire it's loaded event before initializing.
      if (this.app.events) this.app.events.emit(`hooks:loaded:${type}:${hook}`);
    });

    this.app.log.verbose('  └ done!');
    this.app.profile(`${type} ${location}`);
  }

}

module.exports = Nautilus;
