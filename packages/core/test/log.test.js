const Nautilus = require('../index')
let nautilus = new Nautilus()

describe('core:log', function () {
  beforeAll(() => {
    nautilus.app.log.profile = jest.fn().mockReturnValue()
  })

  it('exposes winston at app.log namespace', () => {
    expect(nautilus.app.log).toBeDefined()
    expect(typeof nautilus.app.log.info).toEqual('function')
  })

  it('adds a shortcut to profile code in development', () => {
    expect(nautilus.app.profile).toBeDefined()
    nautilus.app.profile('test')
    expect(nautilus.app.log.profile.mock.calls.length).toEqual(1)
  })

  it('disables profiling in production', () => {
    process.env.NODE_ENV = 'production'
    nautilus.app.profile('test')
    expect(nautilus.app.log.profile.mock.calls.length).toEqual(1)
    delete process.env.NODE_ENV
  })
})
