const expect = require('expect')
const { fake, spy, stub } = require('sinon')
const request = require('supertest')

const withLogging = require('./log')
const { handler: withResponse } = require('./response')

describe('logging', () => {
  let correlationHeader, error, send
  before(() => {
    error = stub(console, 'error').callsFake(() => true)
    send = fake(withResponse((req, res) => res.ok()))

    correlationHeader = '2c5ea4c0-4067-11e9-8b2d-1b9d6bcdbbfd'
  })

  after(() => {
    error.restore()
  })

  it('adds correlation ID to request', async () => {
    let res = await request(withLogging(send)).get('/')
    expect(send.firstArg.correlation).toBeDefined()
    expect(res.headers['x-correlation-id']).toBeDefined()

    res = await request(withLogging(send)).get('/')
      .set('X-Correlation-ID', correlationHeader)
    expect(send.firstArg.correlation).toBe(correlationHeader)
    expect(res.headers['x-correlation-id']).toBe(correlationHeader)
  })

  it('allows configuration of logging levels', async () => {
    await request(withLogging(send)).get('/').expect(200)
    expect(send.lastArg.log).toBeDefined()

    await request(withResponse(withLogging((req, res, app) => {
      app.log.error('error')
      res.ok()
    }))).get('/').expect(200)
    expect(error.called).toBe(true)

    const debug = spy(console, 'debug')
    await request(withResponse(withLogging((req, res, app) => {
      app.log.debug('debug')
      res.ok()
    }))).get('/').expect(200)
    expect(debug.called).toBe(false)

    const verbose = spy(console, 'log')
    await request(withResponse(withLogging((req, res, app) => {
      app.log.verbose('verbose')
      res.ok()
    }, { log: { level: 'verbose' } }))).get('/').expect(200)
    expect(verbose.called).toBe(true)
  })

  it('includes the correlation ID when logging', async () => {
    await request(withLogging(withResponse((req, res, app) => {
      app.log.error('Error')
      res.ok()
    }))).get('/').set('X-Correlation-ID', correlationHeader).expect(200)

    expect(error.lastCall.firstArg).toBe(correlationHeader)
    expect(error.lastCall.lastArg).toBe('Error')
  })
})
