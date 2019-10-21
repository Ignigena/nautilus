const expect = require('expect')

const Nautilus = require('../../')

describe('core:hooks', function () {
  let faviconLoaded = false
  let viewsLoaded = false

  let nautilus
  before(() => {
    nautilus = new Nautilus({
      bootstrap (app) {
        app.events.once('hooks:loaded:core:favicon', () => {
          faviconLoaded = true
        })
        app.hooks.after('core:views', () => {
          viewsLoaded = true
        })
      }
    })
  })

  it('respects the defined order of hooks', () => {
    expect(nautilus.app.hooks.core.shift()).toEqual('security')
  })

  it('emits an event as each hook is loaded', () => {
    expect(faviconLoaded).toEqual(true)
    expect(viewsLoaded).toEqual(true)
  })

  it('cleans up empty hooks', () => {
    expect(nautilus.app.blueprint).toBeDefined()
    expect(nautilus.app.views).toBeUndefined()
  })
})
