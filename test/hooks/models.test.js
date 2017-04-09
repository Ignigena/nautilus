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
            firstName: String,
            lastName: String,
          },
          virtuals: {
            fullName() {
              return `${this.firstName} ${this.lastName}`;
            },
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

  describe('shortcut actions', () => {
    let record;
    let fixture = {
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
    };

    it('exposes find shortcuts for all models', () => {
      return nautilus.app.model('user').create(fixture, () => {
        return nautilus.app.model('user').find({ email: fixture.email });
      }).then(result => {
        record = result;
        expect(result.email).toEqual(fixture.email);
      });
    });

    it('allows findOne criteria to be an ObjectID', () => {
      return nautilus.app.model('user').findOne(record._id).then(result => {
        expect(result.email).toEqual(fixture.email);
      });
    });

    it('properly configures any virtual fields', () => {
      return nautilus.app.model('user').findOne(record._id).then(result => {
        expect(result.fullName).toEqual('Test User');
      });
    });
  });

  after(done => nautilus.stop(done));

});
