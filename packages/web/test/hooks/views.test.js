const { readdirSync } = require('fs')
const { resolve } = require('path')

const findUp = require('find-up')

const Nautilus = require('../../index')

jest.mock('fs')
jest.mock('find-up')

describe('hooks:views', function () {
  let nautilus
  beforeAll(() => {
    jest.mock(resolve(__dirname, 'config', 'views'), () => {
      const JTS = require('jts')
      const engine = new JTS({
        defaultLayout: 'layout',
        layouts: 'views'
      })

      return {
        engine: {
          ext: 'jts',
          fn: engine.render
        }
      }
    }, { virtual: true })
    readdirSync.mockReturnValue(['config/views.js'])
    findUp.sync.mockReturnValue(resolve(__dirname, 'config'))

    nautilus = new Nautilus({ appPath: __dirname })
  })

  it('uses the configured view engine', () => {
    expect(nautilus.app.config.views.engine.ext).toEqual('jts')
  })
})
