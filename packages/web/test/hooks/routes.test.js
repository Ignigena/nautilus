const expect = require('expect')
const { describe, before, it } = require('mocha')
const request = require('supertest')

const Nautilus = require('../../index')

describe('hooks:routes', function () {
  let nautilus
  before(() => {
    nautilus = new Nautilus({
      slash: false,
      routes: {
        index: (req, res) => res.ok('home'),
        '/hello': function (req, res) {
          res.ok(req.params.id)
        },
        'r|(foo|bar)': function (req, res) {
          res.ok(req.params[0])
        },
        danger: {
          delete (req, res) {
            res.ok()
          },
          post (req, res) {
            this.delete(req, res)
          }
        },
        '/widget/:id?': {
          validate: {
            id: 'isMongoId'
          },
          fn: (req, res) => res.ok('fidget')
        }
      }
    })
  })

  it('allows routes to be declared in configuration', () => request(nautilus.app).get('/hello').expect(200))

  it('includes an optional ID parameter in route', done => {
    request(nautilus.app).get('/hello/world').end(function (err, res) {
      expect(res.text).toEqual('world')
      done(err)
    })
  })

  it('uses the `index` route for root requests', () => request(nautilus.app).get('/').expect(200))

  it('allows routes to be declared as regex', done => {
    request(nautilus.app).get('/foo').end(function (err, res) {
      expect(res.text).toEqual('foo')
      done(err)
    })
  })

  it('allows routes to be method-specific', done => {
    request(nautilus.app).get('/danger').end(function (err, res) {
      if (err) return done(err)
      expect(res.status).toBe(400)

      request(nautilus.app).delete('/danger').end(function (err, res) {
        if (err) return done(err)
        expect(res.status).toBe(200)

        request(nautilus.app).post('/danger').end(function (err, res) {
          if (err) return done(err)
          expect(res.status).toBe(200)
          done(err)
        })
      })
    })
  })

  it('validates routes with an /:id parameter', done => {
    request(nautilus.app).get('/widget').expect(200, err => {
      if (err) return done(err)
      request(nautilus.app).get('/widget/123').expect(400, err => {
        if (err) return done(err)
        request(nautilus.app).get('/widget/55b1249625edc30e0021ce27').expect(200, done)
      })
    })
  })
})
