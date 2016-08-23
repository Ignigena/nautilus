const request = require('supertest');
const Nautilus = require('../../index');

describe('hooks:favicon', function() {

  var nautilus = new Nautilus();
  before(done => nautilus.start(done));

  it('loads a default favicon', () => request(nautilus.app).get('/favicon.ico').expect(200));

  after(done => nautilus.stop(done));

});
