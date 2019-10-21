const expect = require('expect')

const Nautilus = require('../../index')

describe('hooks:sockets', function () {
  const nautilus = new Nautilus()

  it('initializes a socket using the default server', () => {
    expect(nautilus.server).toEqual(nautilus.app.io.httpServer)
  })
})
