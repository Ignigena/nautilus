const expect = require('expect')

const path = require('path')
const rimraf = require('rimraf')

const Nautilus = require('../index')
const writeConfig = require('./util/write-config')

let nautilus

describe('core:config', function () {
  describe('framework configuration', function () {
    before(() => writeConfig('test/lib/defaults/custom', {
      should: true,
      foo: 'fee'
    }))

    before(() => {
      nautilus = new Nautilus()
    })

    it('allows the framework to declare a set of default configuration', () => {
      expect(nautilus.app.config.custom.should).toEqual(true)
      expect(nautilus.app.config.custom.foo).toEqual('fee')
    })
  })

  describe('standard + environment configuration', function () {
    before(() => writeConfig('config/custom', {
      foo: 'bars'
    }))

    before(() => {
      process.env.NODE_ENV = 'test'
      return writeConfig('config/env/test', {
        custom: {
          hello: 'world'
        }
      })
    })

    before(() => {
      nautilus = new Nautilus({ appPath: path.resolve(__dirname, '../') })
    })

    it('merges environment configuration without overwriting', () => {
      expect(nautilus.app.config.custom.foo).toEqual('bars')
      expect(nautilus.app.config.custom.hello).toEqual('world')
    })

    after(done => {
      delete process.env.NODE_ENV
      rimraf(path.join(__dirname, 'lib'), done)
    })
  })

  describe('environment configuration: local', function () {
    before(() => writeConfig('config/env/local', {
      custom: {
        foo: 'bar'
      }
    }))

    before(() => {
      nautilus = new Nautilus({ appPath: path.resolve(__dirname, '../') })
    })

    it('local configuration overrides all other environment levels', () => {
      expect(nautilus.app.config.custom.foo).toEqual('bar')
    })
  })

  describe('runtime configuration', function () {
    before(done => {
      nautilus = new Nautilus({ appPath: path.resolve(__dirname, '../') }, {
        custom: {
          foo: 'allbar'
        }
      })
      done()
    })

    it('runtime configuration overrides all others', () => {
      expect(nautilus.app.config.custom.foo).toEqual('allbar')
    })
  })

  after(done => rimraf(path.join(__dirname, '..', 'config'), done))
})
