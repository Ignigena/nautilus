const fs = require('fs')
const path = require('path')

module.exports = function NautilusCoreHooks (app) {
  app.config.hooks = app.config.hooks || {}
  app.hooks = {
    loaded: []
  }

  // This convenience function is a bit more reliable than simply subscribing to
  // the hook loaded event by name. The reason being that while each hook is
  // loaded in alphabetical order by default, the name of the hook can change as
  // your application matures, or you may want to force it to a different order
  // using the `hook.prototype.order`. In any case, it's better to never assume
  // you know the hook you are waiting on hasn't already been loaded and just
  // use this convenience function instead.
  app.hooks.after = function (hookAddress, fn) {
    if (app.hooks.loaded.indexOf(hookAddress) >= 0) return fn()
    app.events.once(`hooks:loaded:${hookAddress}`, fn)
  }

  /**
   * All core Nautilus hooks are looped through and initialized. The application
   * object is passed along to each hook to allow mutable extensions.
   * @param {String} type The type of hook to load (either `core` or `custom`)
   * @param {String} location The location of the hook if a specific one is
   * being requested. Otherwise, leave blank to load all hooks of this type.
   * @param {Object} arg Second argument to be passed to each hook after `app`.
   */
  app.hooks.load = function loadHooks (type, location, arg) {
    location = location || 'hooks'
    app.profile(`${type} ${location}`)
    app.log.verbose(`Initializing ${type} ${location}...`)
    const dirname = {
      core: path.join(app.frameworkPath, `lib/${location}`),
      custom: path.join(app.appPath, location),
      user: location
    }[type]
    if (!fs.existsSync(dirname)) return

    // All hooks are loaded and assigned a key based on their filename. Folders
    // are scanned recursively by default to allow for flexibility in structure.
    // If a folder only contains a single matching file, the folder name is
    // used as the key and flattened. This prevents `hooks/myHook/index.js` from
    // being loaded as `myHook.index`.
    app.hooks[type] = new app.Loader(dirname).load(/^[\\/]([^\\/]+|.+index)\.js$/).map(item => {
      let hook = path.basename(item.path, '.js')
      if (hook === 'index') hook = item.path.split(path.sep).slice(-2)[0]

      let disabled = (app.config[hook] === false || app.config.hooks[hook] === false)

      return {
        hook,
        fn: !disabled && require(item.path),
        path: item.path
      }
    }).filter(item => typeof item.fn === 'function').sort((a, b) => {
      // The order in which hooks are loaded are determined by the value of their
      // prototype `order`. The default value of any hook is `0`.
      return ((a.fn.prototype && a.fn.prototype.order) || 0) - ((b.fn.prototype && b.fn.prototype.order) || 0)
    }).map(item => {
      app.log.verbose(`  ├ ${item.hook}`)

      app[item.hook] = app[item.hook] || {}
      let hookReturn = item.fn(app, arg)

      // Each hook, both core and custom, will emit an event when it has loaded.
      // For advaned fine-grained control, a hook can wait for any other hook
      // to fire it's `hooks:loaded` event before initializing.
      let locationKey = (location !== 'hooks') ? `:${location}` : ''
      const hookAddress = `${type}${locationKey}:${item.hook}`
      app.hooks.loaded.push(hookAddress)

      app.events.emit(`hooks:loaded:${hookAddress}`, hookReturn)
      app.events.emit(`hooks:loaded${locationKey}`, item.hook, hookReturn)

      if (typeof hookReturn === 'object') {
        app[item.hook] = hookReturn
      }

      if (Object.keys(app[item.hook]).length < 1) delete app[item.hook]
      return item.hook
    })

    app.log.verbose('  └ done!')
    app.profile(`${type} ${location}`)
  }
}
