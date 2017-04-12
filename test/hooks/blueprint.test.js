const expect = require('expect');
const request = require('supertest');
const Nautilus = require('../../index');

describe('hooks:blueprint', function() {

  let nautilus;
  before(done => {
    nautilus = new Nautilus({
      connections: {
        mongo: { url: process.env.DB_MONGO || 'mongodb://127.0.0.1:27017' }
      },
      models: {
        person: {
          schema: {
            email: String,
            name: String,
          },
        }
      }
    });
    nautilus.start(done);
  });

  let newUser;
  before(done => {
    nautilus.app.model('person').create({ email: 'test@test.com', name: 'Test' }).then(user => {
      newUser = user;
      done();
    });
  })

  it('allows a model to be updated using a blueprint', () => {
    let req = {
      body: { email: 'edit@test.com' },
      params: { id: newUser._id },
    };
    nautilus.app.blueprint.update('person', req).then(user => {
      expect(user.email).toEqual('edit@test.com');
      expect(user.name).toEqual(newUser.name);
      expect(user._id).toEqual(newUser._id);
    });
  });

  it('prohibits updating the internal ID field', () => {
    let req = {
      body: { _id: '1234' },
      params: { id: newUser._id },
    };
    nautilus.app.blueprint.update('person', req).then(user => {
      expect(user._id).toEqual(newUser._id);
    });
  });

  after(done => nautilus.stop(done));

});
