const expect = require('expect')
const { fake, stub } = require('sinon')
const request = require('supertest')

const micro = require('micro')
const mongoose = require('mongoose')

const withModels = require('../lib/models')

const createConnection = stub(mongoose, 'createConnection').resolves(true)
const send = fake((req, res) => micro.send(res, 200))

describe('models', () => {
  it('skips if no configuration is provided', async () => {
    const handler = micro(withModels(send))

    await request(handler).get('/')

    expect(createConnection.called).toBe(false)
    expect(send.called).toBe(true)
  })

  it('utilizes connection caching between invocations', async () => {
    const handler = micro(withModels(send, {
      connections: {
        mongo: { uri: 'mongodb://127.0.0.1:27017/test' }
      }
    }))

    await request(handler).get('/')
    expect(createConnection.called).toBe(true)
    const [url, options] = createConnection.lastCall.args
    expect(typeof url).toBe('string')
    expect(options.bufferCommands).toBe(false)

    await request(handler).get('/')
    expect(createConnection.callCount).toBe(1)
  })

  it('parses all models in configuration', async () => {
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
