// Nautilus: Web
// ==
const express = require('express');
const http = require('http');
const Nautilus = require('@nautilus/core');
const parseUrl = require('parseurl');

class NautilusWeb extends Nautilus {
  constructor(config = {}) {
    super(express(), config);
    this.server = this.app.server = new http.Server(this.app);

    // The middleware component adds default Security middleware.
    this.app.profile('middleware');
    require('./lib/core/middleware').bind(this)(this.app);
    this.app.profile('middleware');

    this.app.api = { path: `${this.app.appPath}/api` };

    this.app.hooks.load('core', 'hooks', this.server);
    this.app.hooks.load('custom', 'hooks', this.server);

    // The port number can be overridden by passing a `PORT` environment
    // variable to the Node process. This is done automatically by some hosts
    // such as Heroku.
    this.app.set('port', config.port || process.env.PORT || 3000);
  }

  // Once you're ready to `.start()` the server:
  // ```
  // const nautilus = require('nautilus');
  // var myApp = new Nautilus();
  // // Custom configuration here.
  // myApp.start();
  // ```
  start(cb) {
    // Globally intercept 404 errors and return a `res.notFound` rather than the
    // default Express 404 page. This allows a view to be used when added to
    // your views directory at `responses/404.jts`.
    this.app.use((req, res, next) => {
      if (parseUrl(req).pathname === '/favicon.ico') return next();
      res.notFound();
    });

    let ready = function() {
      this.app.events.emit('ready');
      if (!cb) return;

      // If no Mongo connection is configured OR if Mongo has already
      // established a connection, the ready callback is called immediately.
      if (!this.app.mongo || this.app.mongo.connection.readyState === 1) {
        return cb(null, this.server);
      }

      this.app.mongo.connection.once('connected', () => cb(null, this.server));
    }.bind(this);

    try {
      this.server.listen(this.app.get('port'), () => {
        this.app.log.info();
        this.app.log.info(`Server running on port ${this.server.address().port} in ${this.app.get('env')} mode.`);
        this.app.log.info('To shut down press <CTRL> + C at any time.');
        this.app.log.info();

        if (!this.app.config.waitForReady) {
          return ready();
        }

        // If the launch of the server involves asynchronous activities it may
        // be helpful to enable `waitForReady` in your `app.config` settings.
        // Once all asynchronous activies have been completed, simply call
        // `app.events.emit('ready');` and your callback will fire. This can be
        // useful when testing asynchronous hooks. If you need to delay binding
        // to port see `.startWhenReady()` below.
        this.app.events.once('ready', () => cb(null, this.server));
      });
    } catch (err) {
      cb(err);
    }
    return this.app;
  }

  // This is the functional equivelant to adding `waitForReady` in your
  // `app.config` settings. The primary difference here is that the server will
  // not bind to port before the "ready" event is emitted. This can be useful
  // when deploying to Heroku and utilizing the Preboot setting. Make sure you
  // emit a "ready" event by calling `app.events.emit('ready');` in one of your
  // hooks otherwise the server will never bind to port!
  startWhenReady(cb) {
    this.app.events.once('ready', () => this.start(cb));
  }

  stop(cb) {
    if (!this.app.mongo || !cb)
      return this.server.close(cb);

    this.app.mongo.connection.once('disconnected', cb);
    this.server.close();
  }
}

module.exports = NautilusWeb;
