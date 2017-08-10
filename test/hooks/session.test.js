const cookie = require('cookie');
const expect = require('expect');
const request = require('supertest');
const Nautilus = require('../../index');

describe('hooks:session', function() {

  var routes = {
    '/session': function(req, res) {
      if (!req.session) return res.serverError();
      var count = req.session.count || 1;
      req.session.count = count + 1;
      res.ok(`Session visits: ${count}`);
    }
  };

  describe('enabled', function() {

    let nautilus;
    before(done => {
      nautilus = new Nautilus({ routes });
      nautilus.start(done);
    });

    var session;

    it('assigns a cookie with session ID', function(done) {
      request(nautilus.app).get('/session').expect(200).end((err, response) => {
        expect(response.text).toEqual('Session visits: 1');
        var sessionCookie = cookie.parse(response.headers['set-cookie'][0]);
        expect(sessionCookie['nautilus.sid']).toExist();
        session = sessionCookie['nautilus.sid'];
        done(err);
      });
    });

    it('respects the "Cookie" header', function(done) {
      request(nautilus.app).get('/session').set('Cookie', `nautilus.sid=${session}`).end((err, response) => {
        expect(response.text).toEqual('Session visits: 2');
        done(err);
      });
    });

    after(done => nautilus.stop(done));

  });

  describe('disabled', function() {

    let nautilus;
    before(done => {
      nautilus = new Nautilus({
        session: false,
        routes
      });
      nautilus.start(done);
    });

    it('respects the settings in configuration', () =>
      request(nautilus.app).get('/session').expect(500));

    after(done => nautilus.stop(done));

  });

});
