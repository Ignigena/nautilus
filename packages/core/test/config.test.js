const expect = require('expect');
const rimraf = require('rimraf');

const Nautilus = require('../index');
const writeConfig = require('./util/write-config');

describe('core:config', function() {

  describe('framework configuration', function() {
    before(done => {
      writeConfig(__dirname + '/lib/defaults/custom', {
        should: true,
        foo: 'fee',
      }, done);
    });

    let nautilus;
    before(done => {
      nautilus = new Nautilus();
      done();
    });

    it('allows the framework to declare a set of default configuration', () => {
      expect(nautilus.app.config.custom.should).toEqual(true);
      expect(nautilus.app.config.custom.foo).toEqual('fee');
    });
  });

  describe('standard + environment configuration', function() {
    before(done => {
      writeConfig('custom', {
        foo: 'bars',
      }, done);
    });

    before(done => {
      process.env.NODE_ENV = 'test';
      writeConfig('config/env/test', {
        custom: {
          hello: 'world'
        }
      }, done);
    });

    let nautilus;
    before(done => {
      nautilus = new Nautilus();
      done();
    });

    it('merges environment configuration without overwriting', () => {
      expect(nautilus.app.config.custom.foo).toEqual('bars');
      expect(nautilus.app.config.custom.hello).toEqual('world');
    });

    after(done => {
      delete process.env.NODE_ENV;
      rimraf(__dirname + '/lib', done);
    });
  });

  describe('environment configuration: local', function() {
    before(done => {
      writeConfig('config/env/local', {
        custom: {
          foo: 'bar'
        }
      }, done);
    });

    let nautilus;
    before(done => {
      nautilus = new Nautilus();
      done();
    });

    it('local configuration overrides all other environment levels', () => {
      expect(nautilus.app.config.custom.foo).toEqual('bar');
    });
  });

  describe('runtime configuration', function() {
    let nautilus;
    before(done => {
      nautilus = new Nautilus(null, {
        custom: {
          foo: 'allbar',
        }
      });
      done();
    });

    it('runtime configuration overrides all others', () => {
      expect(nautilus.app.config.custom.foo).toEqual('allbar');
    });
  });

  after(done => rimraf('config', done));

});
