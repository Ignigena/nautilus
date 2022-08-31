const request = require('supertest')

const withErrorHandler = require('./errors')
const { handler: withResponse } = require('./response')

describe('errors', () => {
  const logger = jest.spyOn(console, 'error').mockImplementation()
  const handler = withErrorHandler(withResponse((req, res) => {
    throw new Error('whoops!')
  }))

  beforeEach(() => logger.mockClear())

  it('catches errors thrown in the handler', async () => {
    const { text } = await request(handler).get('/')
    expect(text).toContain('Error: whoops!')
    expect(logger).toHaveBeenCalled()
  })

  it('suppresses the stacktrace in production', async () => {
    const restored = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    const { text } = await request(handler).get('/')
    expect(text).not.toContain('at Function.exports.run')
    expect(logger).toHaveBeenCalled()

    process.env.NODE_ENV = restored
  })

  it('allows a custom error handler to be configured', async () => {
    const customLogger = jest.fn()
    const errorHandler = jest.fn((req, res) => customLogger)
    const handler = withErrorHandler(withResponse((req, res) => {
      throw new Error('whoops!')
    }), { errors: { handler: errorHandler } })

    const { text } = await request(handler).get('/')
    expect(text).toContain('Error: whoops!')
    expect(errorHandler).toHaveBeenCalled()
    expect(logger).not.toHaveBeenCalled()
    expect(customLogger).toHaveBeenCalled()
  })

  it('allows the handler to control the response', async () => {
    const errorHandler = jest.fn((req, res) => () => res.send('[redacted]'))
    const handler = withErrorHandler(withResponse((req, res) => {
      throw new Error('whoops!')
    }), { errors: { handler: errorHandler } })

    const { text } = await request(handler).get('/')
    expect(text).toBe('[redacted]')
  })
})
