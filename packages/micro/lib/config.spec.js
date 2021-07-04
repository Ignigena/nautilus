const expect = require('expect')
const { fake } = require('sinon')
const request = require('supertest')

const micro = require('micro')

const writeConfig = require('../../../test/util/write-config')

const { handler: withConfig } = require('./config')

const send = fake((req, res) => micro.send(res, 200))

describe('config', () => {
  it('uses configuration if provided', async () => {
    const handler = micro(withConfig(send, { foo: 'bar' }))
    await request(handler).get('/')

    expect(send.called).toBe(true)
    expect(send.lastArg.config).toBeDefined()
    expect(send.lastArg.config.foo).toBe('bar')
  })

  it('does not throw if no configuration is present', async () => {
    const handler = micro(withConfig(send))
    await request(handler).get('/')

    expect(send.called).toBe(true)
    expect(send.lastArg.config).toBeDefined()
  })

  it('loads configuration from the filesystem', async () => {
    const temp = await writeConfig('greeting', { hello: 'world' })

    const handler = micro(withConfig(send))
    await request(handler).get('/')

    expect(send.called).toBe(true)
    expect(send.lastArg.config).toBeDefined()
    expect(send.lastArg.config.greeting).toBeDefined()

    await temp.cleanup()
  })
})
