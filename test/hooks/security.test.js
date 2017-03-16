const expect = require('expect');
const request = require('supertest');
const Nautilus = require('../../index');

describe('hooks:security', function() {

  describe('cors default configuration', function() {
    let nautilus;
    before(done => {
      nautilus = new Nautilus();
      nautilus.start(done);
    });

    it('includes a wildcard CORS header', () =>
      request(nautilus.app).get('/').expect('Access-Control-Allow-Origin', '*'));

    after(done => nautilus.stop(done));
  });

  describe('cors custom configuration', function() {
    let nautilus = new Nautilus({
      cors: { origin: ['https://nautilus.website', /nautilus\.website$/] }
    });
    before(done => nautilus.start(done));

    it('displays the appropriate CORS header', () =>
      request(nautilus.app).get('/').set('Origin', 'https://my.nautilus.website')
        .expect('Access-Control-Allow-Origin', 'https://my.nautilus.website'));

    it('refuses a CORS request from a non-whitelisted domain', done => {
      request(nautilus.app).get('/').set('Origin', 'https://notallowed.ninja')
        .end(function(err, res) {
          expect(res.headers['access-control-allow-origin']).toNotExist();
          done(err);
        });
    });

    after(done => nautilus.stop(done));
  });

});
