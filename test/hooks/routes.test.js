const expect = require('expect');
const request = require('supertest');
const Nautilus = require('../../index');

describe('hooks:routes', function() {

  let nautilus;
  before(done => {
    nautilus = new Nautilus({
      slash: false,
      routes: {
        'index': (req, res) => res.ok('home'),
        '/hello': function(req, res) {
          res.ok(req.params.id);
        },
        'r|(foo|bar)': function(req, res) {
          res.ok(req.params[0]);
        }
      }
    });
    nautilus.start(done);
  });

  it('allows routes to be declared in configuration', () => request(nautilus.app).get('/hello').expect(200));

  it('includes an optional ID parameter in route', done => {
    request(nautilus.app).get('/hello/world').end(function(err, res) {
      expect(res.text).toEqual('world');
      done(err);
    });
  });

  it('uses the `index` route for root requests', () => request(nautilus.app).get('/').expect(200));

  it('allows routes to be declared as regex', done => {
    request(nautilus.app).get('/foo').end(function(err, res) {
      expect(res.text).toEqual('foo');
      done(err);
    });
  });

  after(done => nautilus.stop(done));

});
