const fs = require('fs')
const Module = require('module')

const expect = require('expect')
const sinon = require('sinon')

const makeConfig = require('../')

describe('@nautilus/config/loaders/default', () => {
  const mockEnv = {
    'env/beta': { db: { host: 'beta.mongodb.com' } },
    db: { host: 'atlas.mongodb.com' },
    cors: { origin: '*' }
  }

  before(() => {
    const original = Module._load
    sinon.stub(Module, '_load').callsFake((path, parent) => {
      const envConfig = mockEnv[path.split('config/').pop()]
      return envConfig || original(path, parent)
    })

    sinon.stub(fs, 'readdirSync').callsFake(() => ([
      'config/db.js',
      'config/cors.js'
    ]))
  })

  after(() => {
    fs.readdirSync.restore()
    Module._load.restore()
  })

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
