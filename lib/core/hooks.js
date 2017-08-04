const _ = require('lodash');
const fs = require('fs');
const requireAll = require('require-all');

module.exports = function NautilusCoreHooks(app) {
  app.config.hooks = app.config.hooks || {};
  app.hooks = {
    loaded: [],
  };

  // This convenience function is a bit more reliable than simply subscribing to
  // the hook loaded event by name. The reason being that while each hook is
  // loaded in alphabetical order by default, the name of the hook can change as
  // your application matures, or you may want to force it to a different order
  // using the `hook.prototype.order`. In any case, it's better to never assume
  // you know the hook you are waiting on hasn't already been loaded and just
  // use this convenience function instead.
  app.hooks.after = function(hookAddress, fn) {
    if (app.hooks.loaded.indexOf(hookAddress) >= 0) return fn();
    app.events.once(`hooks:loaded:${hookAddress}`, fn);
  };

  /**
   * All core Nautilus hooks are looped through and initialized. The application
   * object is passed along to each hook to allow mutable extensions.
   * @param {String} type The type of hook to load (either `core` or `custom`)
   * @param {String} location The location of the hook if a specific one is
   * being requested. Otherwise, leave blank to load all hooks of this type.
   * @param {Object} arg Second argument to be passed to each hook after `app`.
   */
  app.hooks.load = function loadHooks(type, location, arg) {
    location = location || 'hooks';
    app.profile(`${type} ${location}`);
    app.log.verbose(`Initializing ${type} ${location}...`);
    const dirname = {
      core: `${app.frameworkPath}/lib/${location}`,
      custom: `${app.appPath}/${location}`,
      user: location,
    }[type];
    if (!fs.existsSync(dirname)) return;

    // All hooks are loaded and assigned a key based on their filename. Folders
    // are scanned recursively by default to allow for flexibility in structure.
    // If a folder only contains a single matching file, the folder name is
    // used as the key and flattened. This prevents `hooks/myHook/index.js` from
    // being loaded as `myHook.index`.
    const allHooks = requireAll({ dirname });
    _.each(allHooks, (hook, key) => {
      if (Object.keys(hook).length == 1) {
        allHooks[key] = hook[Object.keys(hook)[0]];
      }
    });

    // The order in which hooks are loaded are determined by the value of their
    // prototype `order`. The default value of any hook is `0`.
    app.hooks[type] = _.orderBy(Object.keys(allHooks), hook =>
      allHooks[hook].prototype && allHooks[hook].prototype.order || 0, 'asc');

    _.each(app.hooks[type], hook => {
      // To disable a hook, change it's configuration value to `false` either
      // through the filesystem config or directly when creating the Nautilus
      // instance. This works the same for core and custom hooks.
      if (app.config[hook] === false || app.config.hooks[hook] === false) return;
      app.log.verbose(`  ├ ${hook}`);

      app[hook] = app[hook] || {};

      let hookReturn = allHooks[hook](app, arg);

      // Each hook, both core and custom, will emit an event when it has loaded.
      // For advaned fine-grained control, a hook can wait for any other hook
      // to fire it's `hooks:loaded` event before initializing.
      let locationKey = (location !== 'hooks') ? `:${location}` : '';
      const hookAddress = `${type}${locationKey}:${hook}`;
      app.hooks.loaded.push(hookAddress);

      if (app.events) {
        app.events.emit(`hooks:loaded:${hookAddress}`, hookReturn);
        app.events.emit(`hooks:loaded${locationKey}`, hook, hookReturn);
      }

      if (typeof hookReturn === 'object') {
        app[hook] = hookReturn;
      }

      if (Object.keys(app[hook]).length < 1) delete app[hook];
    });

    app.log.verbose('  └ done!');
    app.profile(`${type} ${location}`);
  };
};
