const { readdirSync } = require('fs')
const { resolve } = require('path')

const makeConfig = require('..')

jest.mock('fs')

describe('@nautilus/config/loaders/default', () => {
  jest.mock(resolve('../config', 'db'), () => ({ host: 'atlas.mongodb.com' }), { virtual: true })
  jest.mock(resolve('../config', 'cors'), () => ({ origin: '*' }), { virtual: true })
  jest.mock(resolve('../config/env', 'beta'), () => ({ db: { host: 'beta.mongodb.com' } }), { virtual: true })

  readdirSync.mockReturnValue(['config/db.js', 'config/cors.js'])

  beforeEach(() => jest.resetModules())
  afterAll(() => jest.clearAllMocks())

  it('generates configuration from a directory', () => {
    const config = makeConfig('../config')
    expect(config.db).toBeDefined()
    expect(config.db.host).toBe('atlas.mongodb.com')
  })

  it('uses the appropriate `process.env` to detect environment', () => {
    process.env.DEPLOY_ENV = 'beta'
    const config = makeConfig('../config')
    expect(config.db.host).toBe('beta.mongodb.com')
    delete process.env.DEPLOY_ENV
  })
})
