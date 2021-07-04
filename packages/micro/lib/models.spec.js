const expect = require('expect')
const { fake, stub } = require('sinon')
const request = require('supertest')

const micro = require('micro')
const mongoose = require('mongoose')

const withModels = require('./models')

describe('models', () => {
  let connect, send
  before(() => {
    connect = stub(mongoose, 'connect').resolves(true)
    send = fake((req, res) => micro.send(res, 200))
  })

  after(() => {
    connect.restore()
  })

  it('skips if no configuration is provided', async () => {
    const handler = micro(withModels(send))

    await request(handler).get('/')

    expect(connect.called).toBe(false)
    expect(send.called).toBe(true)
  })

  it('utilizes connection caching between invocations', async () => {
    const handler = micro(withModels(send, {
      connections: {
        mongo: { uri: 'mongodb://127.0.0.1:27017/test' }
      }
    }))

    await request(handler).get('/')
    expect(connect.called).toBe(true)
    const [url, options] = connect.lastCall.args
    expect(typeof url).toBe('string')
    expect(options.bufferCommands).toBe(false)

    await request(handler).get('/')
    expect(connect.callCount).toBe(1)
  })

  it('parses all models in configuration', async () => {
    mongoose.models = {}
    mongoose.modelSchema = {}

    const handler = micro(withModels(send, {
      connections: {
        mongo: { uri: 'mongodb://127.0.0.1:27017/test' }
      },
      models: require('../../../examples/micro/config/models')
    }))

    await request(handler).get('/')

    const app = send.lastCall.args[2]
    expect(app.model().length).toBe(2)
    expect(app.model('location').prototype.$isMongooseModelPrototype).toBe(true)
  })
})
