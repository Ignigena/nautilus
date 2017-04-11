const expect = require('expect');
const request = require('supertest');
const Nautilus = require('../../index');

describe('hooks:policies', function() {

  let nautilus;
  before(done => {
    nautilus = new Nautilus({
      slash: false,
      policies: {
        '*': false,
        '/hello': true,
      },
      routes: {
        'index': (req, res) => res.ok('home'),
        '/hello': function(req, res) {
          res.ok('world');
        },
      },
    });
    nautilus.start(done);
  });

  it('allows a catch-all wildcard policy to cover all routes', done => {
    request(nautilus.app).get('/').expect(403, done);
  });

  it('overrides the catch-all with route specific policies', done => {
    request(nautilus.app).get('/hello').expect(200, done);
  });

  after(done => nautilus.stop(done));

});
