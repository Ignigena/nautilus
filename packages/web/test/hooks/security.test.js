const request = require('supertest');
const Nautilus = require('../../index');

describe('hooks:security', function() {

  describe('cors default configuration', function() {
    let nautilus;
    beforeAll(() => {
      nautilus = new Nautilus();
    });

    it('includes a wildcard CORS header', () =>
      request(nautilus.app).get('/').expect('Access-Control-Allow-Origin', '*'));
  });

  describe('cors custom configuration', function() {
    let nautilus = new Nautilus({
      cors: { origin: ['https://nautilus.website', /nautilus\.website$/] }
    });

    it('displays the appropriate CORS header', () =>
      request(nautilus.app).get('/').set('Origin', 'https://my.nautilus.website')
        .expect('Access-Control-Allow-Origin', 'https://my.nautilus.website'));

    it('refuses a CORS request from a non-whitelisted domain', done => {
      request(nautilus.app).get('/').set('Origin', 'https://notallowed.ninja')
        .end(function(err, res) {
          expect(res.headers['access-control-allow-origin']).toBeUndefined();
          done(err);
        });
    });
  });

});
