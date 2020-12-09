const expect = require('expect')
const request = require('supertest')

const Nautilus = require('../../index')

const mongoose = require('mongoose')
const { ObjectID } = require('mongodb')

describe('hooks:blueprint', function () {
  let nautilus
  before(() => {
    nautilus = new Nautilus({
      connections: {
        mongo: { url: process.env.DB_MONGO || 'mongodb://127.0.0.1:27017/test' }
      },
      models: {
        person: {
          schema: {
            email: String,
            name: String
          }
        }
      },
      slash: false
    })
  })

  let newUser
  before(async () => {
    newUser = await nautilus.app.model('person').create({ email: 'test@test.com', name: 'Test' })
  })

  it('allows a model to be updated using a blueprint', () => {
    const req = {
      body: { email: 'edit@test.com' },
      params: { id: newUser._id }
    }
    nautilus.app.blueprint.update('person', req).then(user => {
      expect(user.email).toEqual('edit@test.com')
      expect(user.name).toEqual(newUser.name)
      expect(user._id).toEqual(newUser._id)
    })
  })

  it('allows blueprint updates through HTTP', done => {
    request(nautilus.app).put('/person/' + newUser._id)
      .set('Accept', 'application/json')
      .send({ email: 'changed@test.com' })
      .expect(200, (err, response) => {
        expect(response.body.data.email).toEqual('changed@test.com')
        expect(response.body.data._id).toEqual(newUser._id.toString())
        done(err)
      })
  })

  it('prohibits updating the internal ID field', () => {
    const req = {
      body: { _id: '1234' },
      params: { id: newUser._id }
    }
    nautilus.app.blueprint.update('person', req).then(user => {
      expect(user._id).toEqual(newUser._id)
    })
  })

  it('prohibits findOne requests with an invalid mongoid', done => {
    request(nautilus.app).get('/person/123').expect(400, done)
  })

  it('allows findOne requests with an valid mongoid', done => {
    request(nautilus.app).get(`/person/${newUser._id}`).expect(200, done)
  })

  it('returns a 404 when an entity is not found', done => {
    request(nautilus.app).get(`/person/${new ObjectID()}`).expect(404, done)
  })

  after(done => {
    mongoose.deleteModel(/.+/)
    mongoose.models = {}
    nautilus.stop(done)
  })
})
