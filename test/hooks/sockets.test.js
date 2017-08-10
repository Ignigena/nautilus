const expect = require('expect');
const request = require('supertest');
const Nautilus = require('../../index');

describe('hooks:sockets', function() {

  let nautilus;
  before(done => {
    nautilus = new Nautilus();
    nautilus.start(done);
  });

  it('initializes a socket using the default server', () => {
    expect(nautilus.server).toEqual(nautilus.app.io.httpServer);
  });

  after(done => nautilus.stop(done));

});
