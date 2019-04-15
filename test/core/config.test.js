const path = require('path');
const fs = require('fs-extra');

const writeConfig = require('../util/writeConfig');

const Nautilus = require('../../index');

describe('hooks:config', function() {

  describe('environment configuration', function() {
    let nautilus;
    beforeAll(async () => {
      await writeConfig('custom', {
        foo: 'bars',
      });

      await writeConfig('env/test', {
        custom: {
          hello: 'world'
        }
      });

      nautilus = new Nautilus();
    });

    it('merges environment configuration without overwriting', () => {
      expect(nautilus.app.config.custom.foo).toEqual('bars');
      expect(nautilus.app.config.custom.hello).toEqual('world');
    });

    afterAll(done => nautilus.stop(done));
  });

  describe('local configuration', function() {
    let nautilus;
    beforeAll(async () => {
      await writeConfig('env/local', {
        custom: {
          foo: 'bar'
        }
      });

      nautilus = new Nautilus();
    });

    it('local configuration overrides all others', () => {
      expect(nautilus.app.config.custom.foo).toEqual('bar');
    });
  });

  afterAll(() => fs.remove(path.resolve(__dirname, '../../config')));

});
