const { describe, before, it } = require('mocha')
const request = require('supertest')

const Nautilus = require('../../index')

describe('hooks:favicon', function () {
  let nautilus
  before(() => {
    nautilus = new Nautilus()
  })

  it('loads a default favicon', () => request(nautilus.app).get('/favicon.ico').expect(200))
})
