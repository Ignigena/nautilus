const EventEmitter = require('events');

module.exports = function eventsHook(app) {
  class NautilusEmitter extends EventEmitter {}
  app.events = new NautilusEmitter();
};
