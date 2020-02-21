const expect = require('expect')

const writeConfig = require('../../../../test/util/write-config')

const Nautilus = require('../../index')

describe('hooks:views', function () {
  let temp
  before(async () => {
    temp = await writeConfig('views', `
      var JTS = require('jts');
      var engine = new JTS({
        defaultLayout: 'layout',
        layouts: 'views'
      });

      module.exports = {
        engine: {
          ext: 'jts',
          fn: engine.render,
        },
      };
    `)
  })

  let nautilus
  before(() => {
    nautilus = new Nautilus({ appPath: __dirname })
  })

  it('uses the configured view engine', () => {
    expect(nautilus.app.config.views.engine.ext).toEqual('jts')
  })

  after(() => temp.cleanup())
})
