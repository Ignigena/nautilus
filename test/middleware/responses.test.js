process.env.NODE_ENV = 'test';

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
  nautilus.app.get('/response/error', (req, res) => res.serverError('error'));

  before(done => nautilus.start(done));

  it('res.badRequest', done => request(nautilus.app).get('/response/bad/').expect(400, done));
  it('res.created', done => request(nautilus.app).get('/response/created/').expect(201, done));
  it('res.forbidden', done => request(nautilus.app).get('/response/forbidden/').expect(403, done));
  it('res.notFound', done => request(nautilus.app).get('/response/notFound/').expect(404, done));
  it('res.ok', done => request(nautilus.app).get('/response/ok/').expect(200, done));
  it('res.redirect', done => request(nautilus.app).get('/response/redirect/').expect(302, done));
  it('res.redirect (permanent)', done => request(nautilus.app).get('/response/redirectPermanent/').expect(301, done));
  it('res.serverError', done => request(nautilus.app).get('/response/error/').expect(500, done));

  after(() => nautilus.server.close());

});
