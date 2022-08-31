const Nautilus = require('../index')

describe('core:log', function () {
  const nautilus = new Nautilus()
  nautilus.app.log.profile = jest.fn()

  afterEach(() => jest.clearAllMocks())

  it('exposes winston at app.log namespace', () => {
    expect(nautilus.app.log).toBeDefined()
    expect(typeof nautilus.app.log.info).toEqual('function')
  })

  it('adds a shortcut to profile code in development', () => {
    expect(nautilus.app.profile).toBeDefined()
    nautilus.app.profile('test')
    expect(nautilus.app.log.profile).toHaveBeenCalled()
  })

  it('disables profiling in production', () => {
    process.env.NODE_ENV = 'production'
    nautilus.app.profile('test')
    expect(nautilus.app.log.profile).not.toHaveBeenCalled()
    delete process.env.NODE_ENV
  })
})
