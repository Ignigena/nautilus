const request = require('supertest');
const Nautilus = require('../../index');

describe('hooks:sockets', function() {

  let nautilus = new Nautilus();

  it('initializes a socket using the default server', () => {
    expect(nautilus.server).toEqual(nautilus.app.io.httpServer);
  });

});
