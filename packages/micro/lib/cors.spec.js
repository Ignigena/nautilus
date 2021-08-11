const request = require('supertest')

const { handler: withCors } = require('./cors')

describe('cors', () => {
  const handler = withCors((req, res) => res.end())

  it('prevents the route from being called on an OPTIONS request', () =>
    request(handler).options('/').expect(204))

  it('uses a standard wildcard if not an XHR request', () =>
    request(handler).get('/')
      .expect('access-control-allow-origin', '*')
      .expect(200))

  it('echoes back the referer instead of wildcard `*`', () =>
    request(handler).get('/')
      .set('Referer', 'https://apple.com/store')
      .expect('access-control-allow-origin', 'https://apple.com')
      .expect('vary', 'Origin')
      .expect(200))

  it('includes both `Vary` headers on the `OPTIONS` request with referer', () =>
    request(handler).options('/')
      .set('Referer', 'https://apple.com/store')
      .expect('vary', 'Origin, Access-Control-Request-Headers')
      .expect(204))
})
