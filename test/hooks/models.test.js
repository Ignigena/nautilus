const expect = require('expect');
const request = require('supertest');
const Nautilus = require('../../lib/index');

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
            password: String,
          },
          virtuals: {
            fullName() {
              return `${this.firstName} ${this.lastName}`;
            },
          },
          middleware: {
            preSave(next) {
              if (!this.isModified('password')) return next();
              this.password = this.password.split('').reverse().join('');
              next();
            },
          },
          setup(schema, app) {
            app.config.foo = 'bar';
          }
        },
        widget(app) {
          return {
            schema: {
              name: String
            }
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

  it('allows model definitions to returned from a function', () => {
    expect(nautilus.app.model('widget')).toExist();
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
  });

  describe('middleware and virtuals', () => {
    let record;
    let fixture = {
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'password',
    };

    before(() => {
      return nautilus.app.model('user').create(fixture).then(result => {
        record = result;
      });
    })

    it('properly configures any virtual fields', () => {
      expect(record.fullName).toEqual('Test User');
    });

    it('implements all middleware specified in the model', () => {
      expect(record.password).toEqual('drowssap');
    });
  });

  after(done => nautilus.stop(done));

});
