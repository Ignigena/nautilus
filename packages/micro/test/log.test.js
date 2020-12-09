const expect = require('expect')
const { fake, spy, stub } = require('sinon')
const request = require('supertest')

const micro = require('micro')

const withLogging = require('../lib/log')

describe('logging', () => {
  let correlationHeader, error, send
  before(() => {
    error = stub(console, 'error').callsFake(() => true)
    send = fake((req, res) => micro.send(res, 200))

    correlationHeader = '2c5ea4c0-4067-11e9-8b2d-1b9d6bcdbbfd'
  })

  after(() => {
    error.restore()
  })

  it('adds correlation ID to request', async () => {
    await request(micro(withLogging(send))).get('/').expect(200)
    expect(send.firstArg.correlation).toBeDefined()

    await request(micro(withLogging(send))).get('/')
      .set('X-Correlation-ID', correlationHeader).expect(200)
    expect(send.firstArg.correlation).toBe(correlationHeader)
  })

  it('allows configuration of logging levels', async () => {
    await request(micro(withLogging(send))).get('/').expect(200)
    expect(send.lastArg.log).toBeDefined()

    await request(micro(withLogging((req, res, app) => {
      app.log.error('error')
      micro.send(res, 200)
    }))).get('/').expect(200)
    expect(error.called).toBe(true)

    const debug = spy(console, 'debug')
    await request(micro(withLogging((req, res, app) => {
      app.log.debug('debug')
      micro.send(res, 200)
    }))).get('/').expect(200)
    expect(debug.called).toBe(false)

    const verbose = spy(console, 'log')
    await request(micro(withLogging((req, res, app) => {
      app.log.verbose('verbose')
      micro.send(res, 200)
    }, { log: { level: 'verbose' } }))).get('/').expect(200)
    expect(verbose.called).toBe(true)
  })

  it('includes the correlation ID when logging', async () => {
    await request(micro(withLogging((req, res, app) => {
      app.log.error('Error')
      micro.send(res, 200)
    }))).get('/').set('X-Correlation-ID', correlationHeader).expect(200)

    expect(error.lastCall.firstArg).toBe(correlationHeader)
    expect(error.lastCall.lastArg).toBe('Error')
  })
})
