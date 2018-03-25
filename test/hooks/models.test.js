const request = require('supertest');
const Nautilus = require('../../index');

describe('hooks:models', function() {

  let nautilus;
  beforeAll(() => {
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
  });

  it('sets up model definitions', () => {
    expect(nautilus.app.api.model).toBeDefined();
    expect(nautilus.app.api.model.user).toBeDefined();
  });

  it('allows model definitions to returned from a function', () => {
    expect(nautilus.app.model('widget')).toBeDefined();
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

    it('exposes find shortcuts for all models', async () => {
      let create = await nautilus.app.model('user').create(fixture);
      record = await nautilus.app.model('user').findOne({ email: fixture.email });
      expect(record.email).toEqual(fixture.email);
    });

    it('allows findOne criteria to be an ObjectID', async () => {
      let result = await nautilus.app.model('user').findOne(record._id);
      expect(result.email).toEqual(fixture.email);
    });

    it('adds a findOrCreate convenience function', async () => {
      expect(typeof nautilus.app.model('user').findOrCreate).toEqual('function');
    });

    it('findOrCreate allows properties that are used only if record is created', async () => {
      let existing = await nautilus.app.model('user').findOrCreate({ email: fixture.email }, { firstName: 'Updated' });
      expect(existing.firstName).toEqual('Test');

      let created = await nautilus.app.model('user').findOrCreate({ email: 'new@email.com' }, { firstName: 'New' });
      expect(created.firstName).toEqual('New');
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

    beforeAll(() => {
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

});
