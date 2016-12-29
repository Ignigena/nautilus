const EventEmitter = require('events');

module.exports = NautilusCoreEvents;

function NautilusCoreEvents(app) {
  app.events = new EventEmitter();
}

NautilusCoreEvents.prototype.order = -3;
