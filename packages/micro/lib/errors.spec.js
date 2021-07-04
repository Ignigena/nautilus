const expect = require('expect')
const micro = require('micro')
const { fake, stub } = require('sinon')
const request = require('supertest')

const withErrorHandler = require('./errors')
const { handler: withResponse } = require('./response')

describe('errors', () => {
  const logger = stub(console, 'error')
  const handler = micro(withErrorHandler(withResponse((req, res) => {
    throw new Error('whoops!')
  })))

  beforeEach(() => {
    logger.reset()
  })

  after(() => {
    console.error.restore()
  })

  it('catches errors thrown in the handler', async () => {
    const { text } = await request(handler).get('/')
    expect(text).toContain('Error: whoops!')
    expect(logger.called).toBe(true)
  })

  it('suppresses the stacktrace in production', async () => {
    const restored = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    const { text } = await request(handler).get('/')
    expect(text).not.toContain('at Function.exports.run')
    expect(logger.called).toBe(true)

    process.env.NODE_ENV = restored
  })

  it('allows a custom error handler to be configured', async () => {
    const customLogger = fake()
    const errorHandler = fake((req, res) => customLogger)
    const handler = micro(withErrorHandler(withResponse((req, res) => {
      throw new Error('whoops!')
    }), { errors: { handler: errorHandler } }))

    const { text } = await request(handler).get('/')
    expect(text).toContain('Error: whoops!')
    expect(errorHandler.called).toBe(true)
    expect(logger.called).toBe(false)
    expect(customLogger.called).toBe(true)
  })

  it('allows the handler to control the response', async () => {
    const errorHandler = fake((req, res) => () => res.send('[redacted]'))
    const handler = micro(withErrorHandler(withResponse((req, res) => {
      throw new Error('whoops!')
    }), { errors: { handler: errorHandler } }))

    const { text } = await request(handler).get('/')
    expect(text).toBe('[redacted]')
  })
})
