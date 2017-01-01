module.exports = function NautilusCoreHooks(app) {
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
};
