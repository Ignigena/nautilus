const _ = require('lodash');
const session = require('express-session');

module.exports = NautilusCoreSession;

function NautilusCoreSession(app) {
  app.use(session(_.merge({
    secret: require('../util/generateSecret')(),
    name: 'nautilus.sid',
    resave: false,
    saveUninitialized: false,
  }, app.config.session)));

  if (!app.config.session || !app.config.session.secret) {
    app.log.warn('For sessions to persist between launches, provide a session secret in `config/session.js`');
  }

  if (app.config.session && !app.config.session.store) {
    app.log.warn('The default server-side session storage, `MemoryStore`, is purposely not designed for a production environment.');
    app.log.warn('It will leak memory under most conditions, does not scale past a single process, and is meant for debugging and developing.');
  }
}

NautilusCoreSession.prototype.order = -1;
