const request = require('supertest');
const Nautilus = require('../../index');

describe('hooks:favicon', function() {

  let nautilus;
  beforeAll(() => {
    nautilus = new Nautilus();
  });

  it('loads a default favicon', () => request(nautilus.app).get('/favicon.ico').expect(200));

});
