const rimraf = require('rimraf');

const writeConfig = require('../util/writeConfig');

const Nautilus = require('../../index');

describe('hooks:config', function() {

  describe('environment configuration', function() {
    beforeAll(() => writeConfig('custom', {
      foo: 'bars',
    }));

    beforeAll(() => writeConfig('env/test', {
      custom: {
        hello: 'world'
      }
    }));

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
    beforeAll(() => writeConfig('env/local', {
      custom: {
        foo: 'bar'
      }
    }));

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
