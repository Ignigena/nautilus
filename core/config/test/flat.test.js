const Module = require('module')

const expect = require('expect')
const sinon = require('sinon')

const makeConfig = require('../flat')

describe('@nautilus/config/flat', () => {
  const mockEnv = {
    default: { foo: 'bar' },
    test: { env: 'test' },
    local: {}
  }

  before(() => {
    // Skipping the filesystem in these tests for performance reasons.
    const original = Module._load
    sinon.stub(Module, '_load').callsFake((path, parent) => {
      const envConfig = mockEnv[path.split('/').pop()]
      return envConfig || original(path, parent)
    })
  })

  after(() => {
    Module._load.restore()
  })

  it('generates configuration from a directory', () => {
    const config = makeConfig('../config')
    expect(config.foo).toBe('bar')
  })

  it('respects the merge order', () => {
    mockEnv.local = { foo: 'bat' }

    const config = makeConfig('../config')
    expect(config.foo).toBe('bat')
  })

  it('allows runtime config to supercede all', () => {
    const config = makeConfig('../config', { foo: 'baz' })
    expect(config.foo).toBe('baz')
  })

  it('uses the appropriate `process.env` to detect environment', () => {
    expect(makeConfig('../config').env).toBe('test')

    mockEnv.beta = { env: 'beta' }
    process.env.DEPLOY_ENV = 'beta'

    expect(makeConfig('../config').env).toBe('beta')
  })

  it('uses `development` if no `process.env` value is found', () => {
    const env = process.env.NODE_ENV
    delete process.env.DEPLOY_ENV
    delete process.env.NODE_ENV

    mockEnv.development = { env: 'dev' }
    expect(makeConfig('../config').env).toBe('dev')

    process.env.NODE_ENV = env
  })

  it('does not throw if configuration is missing', () => {
    delete mockEnv.test
    delete mockEnv.local

    expect(makeConfig('../config').foo).toBe('bar')
  })
})
