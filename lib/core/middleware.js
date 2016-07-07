const _ = require('lodash');
const lusca = require('lusca');
const session = require('express-session');

module.exports = function middlewareNautilus(app) {
  app.use(require('../middleware/headers'));
  app.use(require('../middleware/slash'));

  app.use(session(_.merge({
    secret: require('../util/generateSecret')(),
    name: 'nautilus.sid',
    resave: false,
    saveUninitialized: false
  }, app.config.session)));
  app.use(lusca(app.config.security));

  if (!app.config.session || !app.config.session.secret) {
    app.log.warn('For sessions to persist between launches, provide a session secret in `config/session.js`');
  }

  if (app.config.session && !app.config.session.store) {
    app.log.warn('The default server-side session storage, `MemoryStore`, is purposely not designed for a production environment.');
    app.log.warn('It will leak memory under most conditions, does not scale past a single process, and is meant for debugging and developing.');
  }

  app.get('/_csrfToken', (req, res) => res.send(res.locals._csrf));

  require('./policies')(app);
};
