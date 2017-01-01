const expect = require('expect');
const Nautilus = require('../../index');

describe('core:hooks', function() {

  let eventFired = false;

  var nautilus = new Nautilus({
    bootstrap(app) {
      app.events.once('hooks:loaded:core:session', () => {
        eventFired = true;
      });
    }
  });
  before(done => nautilus.start(done));

  it('respects the defined order of hooks', () => {
    expect(nautilus.app.hooks.core.shift()).toEqual('security');
  });

  it('emits an event as each hook is loaded', () => {
    expect(eventFired).toEqual(true);
  });

  after(done => nautilus.stop(done));

});
