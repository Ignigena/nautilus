const expect = require('expect')
const micro = require('micro')
const request = require('supertest')

const { handler: withParser } = require('./parse')

const handler = withParser((req, res) => micro.send(res, 200, `Hello ${
  req.body?.who || req.body || req.query?.who || req.cookies?.who || 'anonymous'
}!`))

describe('parser', () => {
  it('body: json', async () => {
    expect((
      await request(handler).post('/').send({ who: 'Ignigena' })
    ).text).toBe('Hello Ignigena!')

    expect((
      await request(handler).post('/').send('{malformed:[{ json }]}').set('Content-Type', 'application/json')
    ).text).toBe('Hello anonymous!')
  })

  it('body: x-www-form-urlencoded', async () => {
    expect((
      await request(handler).post('/').send('who=Ignigena')
    ).text).toBe('Hello Ignigena!')
  })

  it('body: text', async () => {
    expect((
      await request(handler).post('/').send('Ignigena').set('Content-Type', 'text/plain')
    ).text).toBe('Hello Ignigena!')
  })

  it('cookies', async () => {
    expect((
      await request(handler).get('/').set('Cookie', ['who=Ignigena'])
    ).text).toBe('Hello Ignigena!')
  })

  it('query string', async () => {
    expect((
      await request(handler).get('/?who=Ignigena')
    ).text).toBe('Hello Ignigena!')
  })
})
