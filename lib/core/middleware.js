module.exports = function middlewareNautilus(app) {
  app.use(require('../middleware/headers'));

  if (app.config.slash !== false) {
    app.use(require('../middleware/slash'));
  }
};
