// Nautilus: Web
// ==
const express = require('express');
const http = require('http');
const Nautilus = require('./core.js');

class NautilusWeb extends Nautilus {

  constructor(config) {
    super(express(), config);
    this.server = new http.Server(this.app);

    // The middleware component adds default Session and Security middleware.
    this.app.profile('middleware');
    require('./lib/core/middleware')(this.app);
    this.app.profile('middleware');

    this.loadHooks('custom', 'middleware');

    this.loadHooks('core');
    this.loadHooks('custom');

    // The port number can be overridden by passing a `PORT` environment
    // variable to the Node process. This is done automatically by some hosts
    // such as Heroku.
    this.app.set('port', process.env.PORT || 3000);
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
    this.app.use((req, res) => res.notFound());

    try {
      this.server.listen(this.app.get('port'), () => {
        this.app.log.info();
        this.app.log.info(`Server running on port ${this.server.address().port} in ${this.app.get('env')} mode.`);
        this.app.log.info('To shut down press <CTRL> + C at any time.');
        this.app.log.info();

        if (!cb) return;
        if (!this.app.config.waitForReady) return cb(null, this.server);

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
    this.server.close(cb);
  }

}

module.exports = NautilusWeb;
