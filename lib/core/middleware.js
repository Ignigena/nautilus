const lusca = require('lusca');

module.exports = function middlewareNautilus(app) {
  app.use(require('../middleware/headers'));

  if (app.config.slash !== false) {
    app.use(require('../middleware/slash'));
  }

  app.use(lusca(app.config.security));
  app.get('/_csrfToken', (req, res) => res.send(res.locals._csrf));

  require('./policies')(app);
};
