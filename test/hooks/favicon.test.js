process.env.NODE_ENV = 'test';

const request = require('supertest');
const Nautilus = require('../../index');

describe('hooks:favicon', function() {

  var nautilus = new Nautilus();
  before(done => nautilus.start(done));

  it('loads a default favicon', done => request(nautilus.app).get('/favicon.ico').expect(200, done));

  after(() => nautilus.server.close());

});
