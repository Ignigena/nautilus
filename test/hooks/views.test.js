const rimraf = require('rimraf');

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
    nautilus = new Nautilus();
  });

  it('uses the configured view engine', () => {
    expect(nautilus.app.config.views.engine.ext).toEqual('jts');
  });

  afterAll(done => rimraf('./config', done));

});
