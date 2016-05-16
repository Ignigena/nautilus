const JTS = require('jts');
const path = require('path');

module.exports = function viewsHook(app) {
  if (!app.config.views || !app.config.views.engine) {
    app.engine('jts', new JTS().render);
    app.set('view engine', 'jts');
    return;
  }

  if (app.config.views.engine.fn) {
    app.engine(app.config.views.engine.ext, app.config.views.engine.fn);
  }
  app.set('view engine', app.config.views.engine.ext);

  if (app.config.views.path) {
    app.set('views', path.resolve(app.appPath, app.config.views.path));
  }
};
