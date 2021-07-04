const expect = require('expect')
const micro = require('micro')
const request = require('supertest')

const withBodyParser = require('./parse')
const whoami = require('../test/handlers/whoami')

const handler = micro(withBodyParser(whoami))

describe('body parser', () => {
  it('json', async () => {
    expect((
      await request(handler).post('/').send({ who: 'Ignigena' })
    ).text).toBe('Hello Ignigena!')

    expect((
      await request(handler).post('/').send('{malformed:[{ json }]}').set('Content-Type', 'application/json')
    ).text).toBe('Hello anonymous!')
  })

  it('x-www-form-urlencoded', async () => {
    expect((
      await request(handler).post('/').send('who=Ignigena')
    ).text).toBe('Hello Ignigena!')
  })
})
