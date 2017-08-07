const expect = require('expect');
const sinon = require('sinon');

const Nautilus = require('../index');
let nautilus = new Nautilus();

describe('core:log', function() {

  let profileFunc;
  before(() => {
    profileFunc = sinon.stub(nautilus.app.log, 'profile').returns();
  })

  it('exposes winston at app.log namespace', () => {
    expect(nautilus.app.log).toExist();
    expect(typeof nautilus.app.log.info).toEqual('function');
  });

  it('adds a shortcut to profile code in development', () => {
    expect(nautilus.app.profile).toExist();
    nautilus.app.profile('test');
    expect(profileFunc.calledOnce).toEqual(true);
  });

  it('disables profiling in production', () => {
    process.env.NODE_ENV = 'production'
    nautilus.app.profile('test');
    expect(profileFunc.calledOnce).toEqual(true);
    delete process.env.NODE_ENV;
  });

});
