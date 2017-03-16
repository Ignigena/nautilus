const expect = require('expect');
const request = require('supertest');
const Nautilus = require('../../index');

describe('hooks:models', function() {

  let nautilus;
  before(done => {
    nautilus = new Nautilus({
      connections: {
        mongo: { url: process.env.DB_MONGO || 'mongodb://127.0.0.1:27017' }
      },
      models: {
        user: {
          schema: {
            email: String,
            name: String,
          },
          setup(schema, app) {
            app.config.foo = 'bar';
          }
        }
      }
    });
    nautilus.start(done);
  });

  it('sets up model definitions', () => {
    expect(nautilus.app.api.model).toExist();
    expect(nautilus.app.api.model.user).toExist();
  });

  it('executes the setup function after initialization', () => {
    expect(nautilus.app.config.foo).toEqual('bar');
  });

  after(done => nautilus.stop(done));

});
