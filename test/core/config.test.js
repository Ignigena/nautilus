const rimraf = require('rimraf');

const Nautilus = require('../../index');

describe('hooks:config', function() {

  describe('environment configuration', function() {
    beforeAll(done => {
      var config = `
        module.exports = {
          foo: 'bars',
        };
      `;
      require('../util/writeConfig')('custom', config, done);
    });

    beforeAll(done => {
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
    beforeAll(() => {
      nautilus = new Nautilus();
    });

    it('merges environment configuration without overwriting', () => {
      expect(nautilus.app.config.custom.foo).toEqual('bars');
      expect(nautilus.app.config.custom.hello).toEqual('world');
    });

    afterAll(done => nautilus.stop(done));
  });

  describe('local configuration', function() {
    beforeAll(done => {
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
    beforeAll(() => {
      nautilus = new Nautilus();
    });

    it('local configuration overrides all others', () => {
      expect(nautilus.app.config.custom.foo).toEqual('bar');
    });
  });

  afterAll(done => rimraf('./config', done));

});
