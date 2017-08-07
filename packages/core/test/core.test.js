const expect = require('expect');
const Nautilus = require('../index');

describe('core', function() {

  let didBootstrap = false;

  let nautilus;
  before(() => {
    nautilus = new Nautilus(null, {
      bootstrap(app) {
        didBootstrap = true;
      }
    });
  });

  it('allows custom functionality to be run upon creation', () => {
    expect(didBootstrap).toEqual(true);
  });

});
