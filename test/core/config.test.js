const expect = require('expect');
const rimraf = require('rimraf');

const Nautilus = require('../../index');

describe('hooks:config', function() {

  describe('environment configuration', function() {
    before(done => {
      var config = `
        module.exports = {
          foo: 'bars',
        };
      `;
      require('../util/writeConfig')('custom', config, done);
    });

    before(done => {
      var config = `
        module.exports = {
          custom: {
            hello: 'world'
          }
        };
      `;
      require('../util/writeEnvConfig')('test', config, done);
    });

    let nautilus;
    before(done => {
      nautilus = new Nautilus();
      nautilus.start(done);
    });

    it('merges environment configuration without overwriting', () => {
      expect(nautilus.app.config.custom.foo).toEqual('bars');
      expect(nautilus.app.config.custom.hello).toEqual('world');
    });

    after(done => nautilus.stop(done));
  });

  describe('local configuration', function() {
    before(done => {
      var config = `
      module.exports = {
        custom: {
          foo: 'bar'
        }
      };
      `;
      require('../util/writeEnvConfig')('local', config, done);
    });

    let nautilus;
    before(done => {
      nautilus = new Nautilus();
      nautilus.start(done);
    });

    it('local configuration overrides all others', () => {
      expect(nautilus.app.config.custom.foo).toEqual('bar');
    });

    after(done => nautilus.stop(done));
  });

  after(done => rimraf('./config', done));

});
