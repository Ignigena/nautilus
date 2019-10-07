const path = require('path')
const fs = require('fs-extra')

const expect = require('expect')
const { describe, before, after, it } = require('mocha')

const writeConfig = require('../util/writeConfig')

const Nautilus = require('../../index')

describe('hooks:views', function () {
  before(() => writeConfig('views', `
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
  `))

  let nautilus
  before(() => {
    nautilus = new Nautilus({ appPath: path.resolve(__dirname, '../../') })
  })

  it('uses the configured view engine', () => {
    expect(nautilus.app.config.views.engine.ext).toEqual('jts')
  })

  after(() => fs.remove(path.resolve(__dirname, '../../config')))
})
