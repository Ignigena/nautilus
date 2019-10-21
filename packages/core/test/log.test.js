const expect = require('expect')
const { fake } = require('sinon')

const Nautilus = require('../index')
const nautilus = new Nautilus()

describe('core:log', function () {
  before(() => {
    nautilus.app.log.profile = fake()
  })

  it('exposes winston at app.log namespace', () => {
    expect(nautilus.app.log).toBeDefined()
    expect(typeof nautilus.app.log.info).toEqual('function')
  })

  it('adds a shortcut to profile code in development', () => {
    expect(nautilus.app.profile).toBeDefined()
    nautilus.app.profile('test')
    expect(nautilus.app.log.profile.callCount).toEqual(1)
  })

  it('disables profiling in production', () => {
    process.env.NODE_ENV = 'production'
    nautilus.app.profile('test')
    expect(nautilus.app.log.profile.callCount).toEqual(1)
    delete process.env.NODE_ENV
  })
})
