const Nautilus = require('../index')

describe('core', function () {
  let didBootstrap = false

  let nautilus
  beforeAll(() => {
    nautilus = new Nautilus(null, {
      bootstrap (app) {
        didBootstrap = true
      }
    })
  })

  it('allows custom functionality to be run upon creation', () => {
    expect(nautilus.app).toBeDefined()
    expect(didBootstrap).toEqual(true)
  })
})
