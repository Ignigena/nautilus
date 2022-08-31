const config = require('.')
const loaders = require('./loaders')

jest.mock('./loaders')

describe('@nautilus/config', () => {
  beforeAll(() => loaders.default.mockReturnValue({}))
  beforeEach(() => loaders.default.mockClear())

  it('allows a single path to be loaded', () => {
    config('../config')
    expect(loaders.default).toHaveBeenCalledTimes(1)
  })

  it('allows multiple paths to be loaded', () => {
    config(['./app-config', '../framework-config'])
    expect(loaders.default).toHaveBeenCalledTimes(2)
  })

  it('applies top level config over loader', () => {
    loaders.default.mockReturnValue({ foo: 'bar' })
    expect(config('../config', { foo: 'baz' }).foo).toBe('baz')
  })
})
