const expect = require('expect')
const { describe, before, it } = require('mocha')

const Nautilus = require('../index')

describe('core', function () {
  let didBootstrap = false

  let nautilus
  before(() => {
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
