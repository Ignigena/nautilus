process.env.NODE_ENV = 'test';

const expect = require('expect');
const request = require('supertest');
const Nautilus = require('../../index');

describe('middleware:responses', function() {

  let nautilus;
  before(done => {
    nautilus = new Nautilus();
    nautilus.app.get('/response/bad', (req, res) => res.badRequest('bad'));
    nautilus.app.get('/response/created', (req, res) => res.created('created'));
    nautilus.app.get('/response/forbidden', (req, res) => res.forbidden('forbidden'));
    nautilus.app.get('/response/notFound', (req, res) => res.notFound('notFound'));
    nautilus.app.get('/response/ok', (req, res) => res.ok('ok'));
    nautilus.app.get('/response/redirect', (req, res) => res.redirect('http://google.com'));
    nautilus.app.get('/response/redirectPermanent', (req, res) => res.movedPermanently('http://apple.com'));
    nautilus.app.get('/response/error', (req, res) => res.serverError('server error'));
    nautilus.app.get('/response/json', (req, res) => res.ok({ hello: 'world' }));
    nautilus.start(done);
  });

  it('res.badRequest', () => request(nautilus.app).get('/response/bad').expect(400));
  it('res.created', () => request(nautilus.app).get('/response/created').expect(201));
  it('res.forbidden', () => request(nautilus.app).get('/response/forbidden').expect(403));
  it('res.notFound', () => request(nautilus.app).get('/response/notFound').expect(404));
  it('res.ok', () => request(nautilus.app).get('/response/ok').expect(200));
  it('res.redirect', () => request(nautilus.app).get('/response/redirect').expect(302));
  it('res.redirect (permanent)', () => request(nautilus.app).get('/response/redirectPermanent').expect(301));
  it('res.serverError', () => request(nautilus.app).get('/response/error').expect(500));

  describe('content-type negotiation', function() {
    it('uses HTML when appropriate', function(done) {
      request(nautilus.app)
        .get('/response/error')
        .set('Accept', 'text/html')
        .expect(500, (err, response) => {
          expect(response.type).toEqual('text/html');
          expect(response.text).toEqual('server error');
          done(err);
        });
    });

    it('uses JSON when appropriate', function(done) {
      request(nautilus.app)
        .get('/response/error')
        .set('Accept', 'application/json')
        .expect(500, (err, response) => {
          expect(response.type).toEqual('application/json');
          expect(response.body).toEqual({ error: 'server error' });
          done(err);
        });
    });

    it('interchanges `error` for `body` based on response code', function(done) {
      request(nautilus.app)
        .get('/response/ok')
        .set('Accept', 'application/json')
        .expect(200, (err, response) => {
          expect(response.body).toEqual({ body: 'ok' });
          done(err);
        });
    });

    it('uses TXT when appropriate', function(done) {
      request(nautilus.app)
        .get('/response/error')
        .set('Accept', 'text/plain')
        .expect(500, (err, response) => {
          expect(response.type).toEqual('text/plain');
          expect(response.text).toEqual('server error');
          done(err);
        });
    });
  });

  it('prefers JSON when the response is an object', function(done) {
    request(nautilus.app)
      .get('/response/json')
      .set('Accept', 'text/html')
      .expect(200, (err, response) => {
        expect(response.type).toEqual('application/json');
        expect(response.body).toEqual({ hello: 'world' });
        done(err);
      });
  });

  after(done => nautilus.stop(done));

});
