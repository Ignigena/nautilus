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
      },
      slash: false,
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

  it('allows blueprint updates through HTTP', done => {
    request(nautilus.app).put('/person/' + newUser._id)
      .set('Accept', 'application/json')
      .send({ email: 'changed@test.com' })
      .expect(200, (err, response) => {
        expect(response.body.data.email).toEqual('changed@test.com');
        expect(response.body.data._id).toEqual(newUser._id);
        done(err);
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

  it('prohibits findOne requests with an invalid mongoid', done => {
    request(nautilus.app).get('/person/123').expect(400, done);
  });

  after(done => nautilus.stop(done));

});
