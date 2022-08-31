const request = require('supertest')

const withLogging = require('./log')
const { handler: withResponse } = require('./response')

describe('logging', () => {
  let correlationHeader, error, send
  beforeAll(() => {
    error = jest.spyOn(console, 'error').mockImplementation(() => true)
    send = jest.fn(withResponse((req, res) => res.ok()))

    correlationHeader = '2c5ea4c0-4067-11e9-8b2d-1b9d6bcdbbfd'
  })

  beforeEach(() => jest.clearAllMocks())

  it('adds correlation ID to request', async () => {
    let res = await request(withLogging(send)).get('/')
    expect(send.mock.calls[0][0].correlation).toBeDefined()
    expect(res.headers['x-correlation-id']).toBeDefined()

    res = await request(withLogging(send)).get('/')
      .set('X-Correlation-ID', correlationHeader)

    const [req] = send.mock.calls[1]
    expect(req.correlation).toBe(correlationHeader)
    expect(res.headers['x-correlation-id']).toBe(correlationHeader)
  })

  it('allows configuration of logging levels', async () => {
    await request(withLogging(send)).get('/').expect(200)
    expect(send.mock.calls[0][2].log).toBeDefined()

    await request(withResponse(withLogging((req, res, app) => {
      app.log.error('error')
      res.ok()
    }))).get('/').expect(200)
    expect(error).toHaveBeenCalled()

    const debug = jest.spyOn(console, 'debug')
    await request(withResponse(withLogging((req, res, app) => {
      app.log.debug('debug')
      res.ok()
    }))).get('/').expect(200)
    expect(debug).not.toHaveBeenCalled()

    const verbose = jest.spyOn(console, 'log').mockImplementation()
    await request(withResponse(withLogging((req, res, app) => {
      app.log.verbose('verbose')
      res.ok()
    }, { log: { level: 'verbose' } }))).get('/').expect(200)
    expect(verbose).toHaveBeenCalled()
  })

  it('includes the correlation ID when logging', async () => {
    await request(withLogging(withResponse((req, res, app) => {
      app.log.error('Error')
      res.ok()
    }))).get('/').set('X-Correlation-ID', correlationHeader).expect(200)

    expect(error.mock.calls[0][0]).toBe(correlationHeader)
    expect(error.mock.calls[0][1]).toBe('Error')
  })
})
