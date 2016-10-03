module.exports = function middlewareNautilus(app) {
  app.use(require('../middleware/headers'));
  app.use(require('../middleware/slash')(app));
};
