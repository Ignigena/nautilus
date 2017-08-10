const expect = require('expect');
const rimraf = require('rimraf');

const Nautilus = require('../../lib/index');

describe('hooks:views', function() {

  before(done => {
    var config = `
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
    `;
    require('../util/writeConfig')('views', config, done);
  });

  let nautilus;
  before(done => {
    nautilus = new Nautilus();
    nautilus.start(done);
  });

  it('uses the configured view engine', () => {
    expect(nautilus.app.config.views.engine.ext).toEqual('jts');
  });

  after(done => nautilus.stop(done));
  after(done => rimraf('./config', done));

});
