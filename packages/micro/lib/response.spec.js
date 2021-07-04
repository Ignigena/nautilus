const expect = require('expect')
const request = require('supertest')

const micro = require('micro')

const { handler: response } = require('./response')

describe('response', () => {
  it('adds response helpers for common status codes', async () => {
    await Promise.all([
      request(micro(response((req, res) => res.ok()))).get('/').expect(200),
      request(micro(response((req, res) => res.created()))).get('/').expect(201),
      request(micro(response((req, res) => res.redirect()))).get('/').expect(301),
      request(micro(response((req, res) => res.badRequest()))).get('/').expect(400),
      request(micro(response((req, res) => res.forbidden()))).get('/').expect(403),
      request(micro(response((req, res) => res.notFound()))).get('/').expect(404),
      request(micro(response((req, res) => res.error()))).get('/').expect(500)
    ])
  })

  it('uses the correct `data` or `error` key in the top level', async () => {
    const good = await request(micro(response((req, res) => res.ok()))).get('/')
    expect(good.text).toContain('OK')
    expect(good.body.data).toBeDefined()
    expect(good.body.error).not.toBeDefined()

    const bad = await request(micro(response((req, res) => res.badRequest()))).get('/')
    expect(bad.text).toContain('Bad Request')
    expect(bad.body.data).not.toBeDefined()
    expect(bad.body.error).toBeDefined()
  })

  it('prevents changing the body when a content-type is specified', async () => {
    const handler = micro(response((req, res) => {
      res.setHeader('Content-Type', 'text/xml; charset=utf-8')
      res.ok('<xml>')
    }))

    const { text } = await request(handler).get('/')
    expect(text).toBe('<xml>')
  })
})
