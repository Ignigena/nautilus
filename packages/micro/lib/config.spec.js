const { readdirSync } = require('fs')
const { resolve } = require('path')

const request = require('supertest')
const findUp = require('find-up')

const { handler: withConfig } = require('./config')
const { handler: withResponse } = require('./response')

jest.mock('fs')
jest.mock('find-up')

describe('config', () => {
  const send = jest.fn(withResponse((req, res) => res.ok()))

  beforeEach(() => jest.resetModules())
  afterEach(() => send.mockClear())

  it('uses configuration if provided', async () => {
    const handler = withConfig(send, { foo: 'bar' })
    await request(handler).get('/')

    expect(send).toHaveBeenCalled()
    expect(send.mock.calls[0][2].config).toBeDefined()
    expect(send.mock.calls[0][2].config.foo).toBe('bar')
  })

  it('does not throw if no configuration is present', async () => {
    const handler = withConfig(send)
    await request(handler).get('/')

    expect(send).toHaveBeenCalled()
    expect(send.mock.calls[0][2].config).toBeDefined()
  })

  it('loads configuration from the filesystem', async () => {
    jest.mock(resolve(__dirname, 'config', 'greeting'), () => ({ hello: 'world' }), { virtual: true })
    readdirSync.mockReturnValue(['config/greeting.js'])
    findUp.sync.mockReturnValue(resolve(__dirname, 'config'))

    const handler = withConfig(send)
    await request(handler).get('/')

    expect(send).toHaveBeenCalled()
    expect(send.mock.calls[0][2].config).toBeDefined()
    expect(send.mock.calls[0][2].config.greeting).toStrictEqual({ hello: 'world' })
  })
})
