const { resolve } = require('path')

const makeConfig = require('..')

describe('@nautilus/config/loaders/flat', () => {
  jest.mock(resolve('../config', 'default'), () => ({ foo: 'bar' }), { virtual: true })
  jest.mock(resolve('../config', 'test'), () => ({ env: 'test' }), { virtual: true })

  beforeEach(() => jest.resetModules())
  afterAll(() => jest.clearAllMocks())

  it('generates configuration from a directory', () => {
    const config = makeConfig('../config', { flat: true })
    expect(config.foo).toBe('bar')
  })

  it('respects the merge order', () => {
    jest.mock(resolve('../config', 'local'), () => ({ foo: 'bat' }), { virtual: true })
    const config = makeConfig('../config', { flat: true, ignoreLocal: false })
    expect(config.foo).toBe('bat')
  })

  it('uses the appropriate `process.env` to detect environment', () => {
    expect(makeConfig('../config', { flat: true }).env).toBe('test')

    jest.mock(resolve('../config', 'beta'), () => ({ env: 'beta' }), { virtual: true })
    process.env.DEPLOY_ENV = 'beta'

    expect(makeConfig('../config', { flat: true }).env).toBe('beta')
  })

  it('uses `development` if no `process.env` value is found', () => {
    const env = process.env.NODE_ENV
    delete process.env.DEPLOY_ENV
    delete process.env.NODE_ENV

    jest.mock(resolve('../config', 'development'), () => ({ env: 'dev' }), { virtual: true })
    expect(makeConfig('../config', { flat: true }).env).toBe('dev')

    process.env.NODE_ENV = env
  })

  it('ignores local configuration when configured', () => {
    jest.mock(resolve('../config', 'local'), () => ({ env: 'local' }), { virtual: true })
    expect(makeConfig('../config', { flat: true, ignoreLocal: true }).env).not.toBe('local')
    expect(makeConfig('../config', { flat: true, ignoreLocal: false }).env).toBe('local')
  })
})
