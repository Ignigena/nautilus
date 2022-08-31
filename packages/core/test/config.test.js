const Nautilus = require('../index')

const { readdirSync } = require('fs')
const { resolve } = require('path')

jest.mock('fs')

describe('core:config', function () {
  beforeEach(() => jest.resetModules())
  afterAll(() => jest.clearAllMocks())

  describe('framework configuration', function () {
    it('allows the framework to declare a set of default configuration', async () => {
      jest.mock(resolve(__dirname, 'lib/defaults', 'custom'), () => ({ should: true, foo: 'fee' }), { virtual: true })

      readdirSync.mockReturnValueOnce(['lib/defaults/custom.js']).mockReturnValueOnce([])

      const nautilus = new Nautilus({ appPath: __dirname })

      expect(nautilus.app.config.custom.should).toEqual(true)
      expect(nautilus.app.config.custom.foo).toEqual('fee')
    })
  })

  describe('standard + environment configuration', function () {
    it('merges environment configuration without overwriting', async () => {
      jest.mock(resolve(__dirname, 'config', 'custom'), () => ({ foo: 'bars' }), { virtual: true })
      jest.mock(resolve(__dirname, 'config/env', 'test'), () => ({ custom: { hello: 'world' } }), { virtual: true })

      readdirSync.mockReturnValueOnce([]).mockReturnValueOnce(['config/custom.js'])

      process.env.NODE_ENV = 'test'
      const nautilus = new Nautilus({ appPath: __dirname })

      expect(nautilus.app.config.custom.foo).toEqual('bars')
      expect(nautilus.app.config.custom.hello).toEqual('world')
    })
  })

  describe('environment configuration: local', function () {
    it('local configuration overrides all other environment levels', async () => {
      jest.mock(resolve(__dirname, 'config', 'custom'), () => ({ foo: 'bars' }), { virtual: true })
      jest.mock(resolve(__dirname, 'config/env', 'local'), () => ({ custom: { foo: 'bar' } }), { virtual: true })

      readdirSync.mockReturnValueOnce([]).mockReturnValueOnce(['config/custom.js'])

      process.env.NODE_ENV = 'dev'
      const nautilus = new Nautilus({ appPath: __dirname })

      expect(nautilus.app.config.custom.foo).toEqual('bar')
      process.env.NODE_ENV = 'test'
    })
  })

  describe('runtime configuration', function () {
    it('runtime configuration overrides all others', async () => {
      jest.mock(resolve(__dirname, 'config', 'custom'), () => ({ foo: 'bars' }), { virtual: true })
      readdirSync.mockReturnValueOnce([]).mockReturnValueOnce(['config/custom.js'])

      const nautilus = new Nautilus({ appPath: __dirname }, { custom: { foo: 'allbar' } })

      expect(nautilus.app.config.custom.foo).toEqual('allbar')
    })
  })
})
