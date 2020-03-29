const expect = require('expect')
const sinon = require('sinon')

const config = require('../')
const loaders = require('../loaders')

describe('@nautilus/config', () => {
  let mockLoader
  before(() => {
    mockLoader = sinon.stub(loaders, 'default').returns({})
  })

  beforeEach(() => mockLoader.resetHistory())

  after(() => mockLoader.restore())

  it('allows a single path to be loaded', () => {
    config('../config')
    expect(mockLoader.calledOnce).toBe(true)
  })

  it('allows multiple paths to be loaded', () => {
    config(['./app-config', '../framework-config'])
    expect(mockLoader.calledTwice).toBe(true)
  })

  it('applies top level config over loader', () => {
    mockLoader.returns({ foo: 'bar' })
    expect(config('../config', { foo: 'baz' }).foo).toBe('baz')
  })
})
