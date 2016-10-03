'use strict';
const EventEmitter = require('events');

module.exports = NautilusCoreEvents;

function NautilusCoreEvents(app) {
  class NautilusEmitter extends EventEmitter {}
  app.events = new NautilusEmitter();
}

NautilusCoreEvents.prototype.order = -3;
