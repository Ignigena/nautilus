process.env.NODE_ENV = 'test';

const expect = require('expect');
const request = require('supertest');
const Nautilus = require('../../index');

describe('middleware:responses', function() {

  var nautilus = new Nautilus();

  nautilus.app.get('/response/bad', (req, res) => res.badRequest('bad'));
  nautilus.app.get('/response/created', (req, res) => res.created('created'));
  nautilus.app.get('/response/forbidden', (req, res) => res.forbidden('forbidden'));
  nautilus.app.get('/response/notFound', (req, res) => res.notFound('notFound'));
  nautilus.app.get('/response/ok', (req, res) => res.ok('ok'));
  nautilus.app.get('/response/redirect', (req, res) => res.redirect('http://google.com', true));
  nautilus.app.get('/response/redirectPermanent', (req, res) => res.redirect('http://apple.com'));
  nautilus.app.get('/response/error', (req, res) => res.serverError('server error'));

  before(done => nautilus.start(done));

  it('res.badRequest', done => request(nautilus.app).get('/response/bad/').expect(400, done));
  it('res.created', done => request(nautilus.app).get('/response/created/').expect(201, done));
  it('res.forbidden', done => request(nautilus.app).get('/response/forbidden/').expect(403, done));
  it('res.notFound', done => request(nautilus.app).get('/response/notFound/').expect(404, done));
  it('res.ok', done => request(nautilus.app).get('/response/ok/').expect(200, done));
  it('res.redirect', done => request(nautilus.app).get('/response/redirect/').expect(302, done));
  it('res.redirect (permanent)', done => request(nautilus.app).get('/response/redirectPermanent/').expect(301, done));
  it('res.serverError', done => request(nautilus.app).get('/response/error/').expect(500, done));

  describe('content-type negotiation', function() {
    it('uses HTML when appropriate', done => {
      request(nautilus.app)
        .get('/response/error/')
        .set('Accept', 'text/html')
        .expect(500, (err, response) => {
          expect(response.type).toEqual('text/html');
          expect(response.text).toEqual('server error');
          done(err);
        });
    });

    it('uses JSON when appropriate', done => {
      request(nautilus.app)
        .get('/response/error/')
        .set('Accept', 'application/json')
        .expect(500, (err, response) => {
          expect(response.type).toEqual('application/json');
          expect(response.body).toEqual({ error: 'server error' });
          done(err);
        });
    });

    it('interchanges `error` for `body` based on response code', done => {
      request(nautilus.app)
        .get('/response/ok/')
        .set('Accept', 'application/json')
        .expect(200, (err, response) => {
          expect(response.body).toEqual({ body: 'ok' });
          done(err);
        });
    });

    it('uses TXT when appropriate', done => {
      request(nautilus.app)
        .get('/response/error/')
        .set('Accept', 'none')
        .expect(500, (err, response) => {
          expect(response.type).toEqual('text/plain');
          expect(response.text).toEqual('server error');
          done(err);
        });
    });
  });

  after(() => nautilus.server.close());

});
