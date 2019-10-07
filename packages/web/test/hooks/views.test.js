const path = require('path');
const fs = require('fs-extra');

const writeConfig = require('../util/writeConfig');

const Nautilus = require('../../index');

describe('hooks:views', function() {

  beforeAll(() => writeConfig('views', `
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
  `));

  let nautilus;
  beforeAll(() => {
    nautilus = new Nautilus({ appPath: path.resolve(__dirname, '../../') });
  });

  it('uses the configured view engine', () => {
    expect(nautilus.app.config.views.engine.ext).toEqual('jts');
  });

  afterAll(() => fs.remove(path.resolve(__dirname, '../../config')));

});
