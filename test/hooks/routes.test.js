const request = require('supertest');
const Nautilus = require('../../index');

describe('hooks:routes', function() {

  var nautilus = new Nautilus({
    slash: false,
    routes: {
      '/hello': function(req, res) {
        res.ok('world');
      }
    }
  });
  before(done => nautilus.start(done));

  it('allows routes to be declared in configuration', () => request(nautilus.app).get('/hello').expect(200));

  after(done => nautilus.stop(done));

});
