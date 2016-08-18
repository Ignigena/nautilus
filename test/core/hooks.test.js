const expect = require('expect');
const Nautilus = require('../../index');

describe('core:hooks', function() {

  var nautilus = new Nautilus();
  before(done => nautilus.start(done));

  it('respects the defined order of hooks', () => {
    expect(nautilus.app.hooks.pop()).toEqual('connect');
  });

  after(() => nautilus.server.close());

});
