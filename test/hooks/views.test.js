const expect = require('expect');
const fs = require('fs');

const Nautilus = require('../../index');

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

  var nautilus;
  before(done => {
    nautilus = new Nautilus();
    nautilus.start(done);
  });

  it('uses the configured view engine', () => {
    expect(nautilus.app.config.views.engine.ext).toEqual('jts');
  });

  after(() => nautilus.server.close());
  after(() => fs.unlink('./config/views.js'));
  after(() => fs.rmdirSync('./config'));

});
