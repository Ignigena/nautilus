const expect = require('expect')
const micro = require('micro')
const request = require('supertest')

const { handler: withParser } = require('./parse')
const whoami = require('../test/handlers/whoami')

const handler = micro(withParser(whoami))

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

  it('cookies', async () => {
    expect((
      await request(handler).get('/').set('Cookie', ['who=Ignigena'])
    ).text).toBe('Hello Ignigena!')
  })
})
