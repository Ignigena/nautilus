module.exports = function middlewareNautilus(app) {
  app.use(require('../middleware/headers'));
  app.use(require(`../middleware/${app.config.slash === false ? 'noSlash' : 'slash'}`));
};
