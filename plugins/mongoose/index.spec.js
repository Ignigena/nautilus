const request = require('supertest')

const micro = require('micro')
const mongoose = require('mongoose')

const withModels = require('./')

describe('models', () => {
  let connect, send
  beforeAll(() => {
    connect = jest.spyOn(mongoose, 'connect').mockReturnValue(true)
    send = jest.fn((req, res) => micro.send(res, 200))
  })

  afterEach(() => jest.clearAllMocks())

  it('skips if no configuration is provided', async () => {
    const handler = micro(withModels(send))

    await request(handler).get('/')

    expect(connect).not.toHaveBeenCalled()
    expect(send).toHaveBeenCalled()
  })

  it('utilizes connection caching between invocations', async () => {
    const handler = micro(withModels(send, {
      connections: {
        mongo: { uri: 'mongodb://127.0.0.1:27017/test' }
      }
    }))

    await request(handler).get('/')
    expect(connect).toHaveBeenCalled()
    const [url, options] = connect.mock.calls[0]
    expect(typeof url).toBe('string')
    expect(options.bufferCommands).toBe(false)

    await request(handler).get('/')
    expect(connect).toHaveBeenCalledTimes(1)
  })

  it('parses all models in configuration', async () => {
    mongoose.models = {}
    mongoose.modelSchema = {}

    const handler = micro(withModels(send, {
      connections: {
        mongo: { uri: 'mongodb://127.0.0.1:27017/test' }
      },
      models: require('../../examples/micro/config/models')
    }))

    await request(handler).get('/')

    const app = send.mock.calls[0][2]
    expect(app.model().length).toBe(2)
    expect(app.model('location').prototype.$isMongooseModelPrototype).toBe(true)
  })
})
