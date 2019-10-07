const { describe, before, it } = require('mocha')
const request = require('supertest')

const Nautilus = require('../../index')

describe('hooks:policies', function () {
  let nautilus
  before(() => {
    nautilus = new Nautilus({
      slash: false,
      policies: {
        '*': false,
        '/hello': true,
        '/goodbye': {
          fn: function noGoodbyes (req, res, next) {
            return res.forbidden()
          },
          methods: ['DELETE']
        },
        '/knock': {
          fn: function whosThere (req, res, next) {
            return function (fruit) {
              if (fruit === 'orange') return res.ok()
              res.forbidden()
            }
          },
          args: 'orange'
        }
      },
      routes: {
        index: (req, res) => res.ok('home'),
        '/hello': (req, res) => res.ok('world'),
        '/goodbye': (req, res) => res.ok('cruel world'),
        '/knock': (req, res) => res.ok('orange you glad?')
      }
    })
  })

  it('allows a catch-all wildcard policy to cover all routes', done => {
    request(nautilus.app).get('/').expect(403, done)
  })

  it('overrides the catch-all with route specific policies', done => {
    request(nautilus.app).get('/hello').expect(200, done)
  })

  it('ignores query strings when matching policies', done => {
    request(nautilus.app).get('/hello?takemeto=leader').expect(200, done)
  })

  it('allows a policy to be restricted based on the request method', done => {
    request(nautilus.app).get('/goodbye').expect(200, err => {
      if (err) return done(err)
      request(nautilus.app).delete('/goodbye').expect(403, done)
    })
  })

  it('allows a policy to accept an argument from within the policy configuration', done => {
    request(nautilus.app).get('/knock').expect(200, done)
  })
})
