const Nautilus = require('../../index');

describe('core:hooks', function() {

  let sessionLoaded = false;
  let viewsLoaded = false;

  let nautilus;
  beforeAll(() => {
    nautilus = new Nautilus({
      bootstrap(app) {
        app.events.once('hooks:loaded:core:session', () => {
          sessionLoaded = true;
        });
        app.hooks.after('core:views', () => {
          viewsLoaded = true;
        });
      }
    });
  });

  it('respects the defined order of hooks', () => {
    expect(nautilus.app.hooks.core.shift()).toEqual('security');
  });

  it('emits an event as each hook is loaded', () => {
    expect(sessionLoaded).toEqual(true);
    expect(viewsLoaded).toEqual(true);
  });

  it('cleans up empty hooks', () => {
    expect(nautilus.app.blueprint).toBeDefined();
    expect(nautilus.app.views).toBeUndefined();
  })

  afterAll(done => nautilus.stop(done));

});
