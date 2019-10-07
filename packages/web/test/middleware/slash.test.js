process.env.NODE_ENV = 'test'

const expect = require('expect')
const { describe, before, it } = require('mocha')
const request = require('supertest')

const Nautilus = require('../../index')

describe('middleware:slash', function () {
  let nautilus
  before(() => {
    nautilus = new Nautilus({
      slash: {
        whitelist: ['whitelist/(.*)']
      }
    })
    nautilus.app.get('/slash', (req, res) => res.ok('ok'))
    nautilus.app.get('/slash.png', (req, res) => res.ok('ok'))
    nautilus.app.get('/whitelist/path', (req, res) => res.ok('ok'))
  })

  it('adds a slash to the end of all URLs', () =>
    request(nautilus.app).get('/slash/').expect(200))

  it('redirects a URL without a trailing slash', function (done) {
    request(nautilus.app).get('/slash').expect(301, (err, res) => {
      expect(res.headers.location).toEqual('/slash/')
      done(err)
    })
  })

  it('ignores a URL that looks like a resource', () =>
    request(nautilus.app).get('/slash.png').expect(200))

  it('ignores slash configuration on routes that are whitelisted', () =>
    request(nautilus.app).get('/whitelist/path').expect(200))

  it('adds a slash in the proper place when query strings are included', function (done) {
    request(nautilus.app).get('/slash?query=string').expect(301, (err, res) => {
      expect(res.headers.location).toEqual('/slash/?query=string')
      done(err)
    })
  })

  it('recognizes a properly slashed URL with a query string', () =>
    request(nautilus.app).get('/slash/?query=string').expect(200))
})
