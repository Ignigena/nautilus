const expect = require('expect')

const Nautilus = require('../index')
const writeConfig = require('../../../test/util/write-config')

let nautilus
let tempLib, temp

describe('core:config', function () {
  describe('framework configuration', function () {
    before(async () => {
      tempLib = await writeConfig('../lib/defaults/custom', {
        should: true,
        foo: 'fee'
      })
      nautilus = new Nautilus({ appPath: __dirname })
    })

    it('allows the framework to declare a set of default configuration', () => {
      expect(nautilus.app.config.custom.should).toEqual(true)
      expect(nautilus.app.config.custom.foo).toEqual('fee')
    })
  })

  describe('standard + environment configuration', function () {
    before(async () => {
      temp = await writeConfig('custom', {
        foo: 'bars'
      })

      process.env.NODE_ENV = 'test'
      await writeConfig('env/test', {
        custom: {
          hello: 'world'
        }
      })

      nautilus = new Nautilus({ appPath: __dirname })
    })

    it('merges environment configuration without overwriting', () => {
      expect(nautilus.app.config.custom.foo).toEqual('bars')
      expect(nautilus.app.config.custom.hello).toEqual('world')
    })

    after(async () => {
      delete process.env.NODE_ENV
      await tempLib.cleanup()
    })
  })

  describe('environment configuration: local', function () {
    before(async () => {
      await writeConfig('env/local', {
        custom: {
          foo: 'bar'
        }
      })
      nautilus = new Nautilus({ appPath: __dirname })
    })

    it('local configuration overrides all other environment levels', () => {
      expect(nautilus.app.config.custom.foo).toEqual('bar')
    })
  })

  describe('runtime configuration', function () {
    before(() => {
      nautilus = new Nautilus({ appPath: __dirname }, {
        custom: {
          foo: 'allbar'
        }
      })
    })

    it('runtime configuration overrides all others', () => {
      expect(nautilus.app.config.custom.foo).toEqual('allbar')
    })
  })

  after(() => temp.cleanup())
})
