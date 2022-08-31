const request = require('supertest')

const path = require('path')
const fs = require('fs')

const { handler: withResponse } = require('./response')

describe('response', () => {
  it('adds response helpers for common status codes', async () => {
    await Promise.all([
      request(withResponse((req, res) => res.ok())).get('/').expect(200),
      request(withResponse((req, res) => res.created())).get('/').expect(201),
      request(withResponse((req, res) => res.nonAuthoritativeInformation())).get('/').expect(203),
      request(withResponse((req, res) => res.redirect())).get('/').expect(301),
      request(withResponse((req, res) => res.badRequest())).get('/').expect(400),
      request(withResponse((req, res) => res.forbidden())).get('/').expect(403),
      request(withResponse((req, res) => res.notFound())).get('/').expect(404),
      request(withResponse((req, res) => res.imATeapot())).get('/').expect(418),
      request(withResponse((req, res) => res.error())).get('/').expect(500)
    ])
  })

  it('uses the correct `data` or `error` key in the top level', async () => {
    const good = await request(withResponse((req, res) => res.ok())).get('/')
    expect(good.text).toContain('OK')
    expect(good.body.data).toBeDefined()
    expect(good.body.error).not.toBeDefined()

    const bad = await request(withResponse((req, res) => res.badRequest())).get('/')
    expect(bad.text).toContain('Bad Request')
    expect(bad.body.data).not.toBeDefined()
    expect(bad.body.error).toBeDefined()
  })

  it('prevents changing the body when a content-type is specified', async () => {
    const handler = withResponse((req, res) => {
      res.setHeader('Content-Type', 'text/xml; charset=utf-8')
      res.ok('<xml>')
    })

    const { text } = await request(handler).get('/')
    expect(text).toBe('<xml>')
  })

  it('handles empty body responses', async () => {
    const handler = withResponse((req, res) => {
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.send()
    })

    const { text } = await request(handler).get('/')
    expect(text).toBe('')
  })

  it('allows headers to be set in bulk', async () => {
    const handler = withResponse((req, res) => {
      res.setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      })
      res.ok()
    })

    const { headers } = await request(handler).get('/')
    expect(headers['access-control-allow-origin']).toBe('*')
    expect(headers['content-type']).toBe('application/json')
  })
})

describe('res.json', () => {
  it('stringifies JSON responses', async () => {
    const handler = withResponse((req, res) => res.json({ hello: 'world' }))
    const { body, text } = await request(handler).get('/')

    expect(body.hello).toBe('world')
    expect(text).toBe('{\n  "hello": "world"\n}')
  })

  it('preserves the original status code', async () => {
    const handler = withResponse((req, res) => res.status(404).json({ error: 'wut' }))
    const { body, status } = await request(handler).get('/')

    expect(body.error).toBe('wut')
    expect(status).toBe(404)
  })

  it('preserves the original content type', async () => {
    const handler = withResponse((req, res) => {
      res.setHeader('Content-Type', 'application/health+json')
      res.json({ status: 'pass' })
    })

    const { body, headers } = await request(handler).get('/')

    expect(body.status).toBe('pass')
    expect(headers['content-type']).toBe('application/health+json')
  })
})

describe('res.send', () => {
  it('handles buffers', async () => {
    const handler = withResponse((req, res) => res.send(Buffer.from('foo')))
    const { body, headers } = await request(handler).get('/')

    expect(body.toString()).toBe('foo')
    expect(headers['content-length']).toBe('3')
    expect(headers['content-type']).toBe('application/octet-stream')
  })

  it('handles streaming responses', async () => {
    const handler = withResponse((req, res) => {
      const stream = fs.createReadStream(path.resolve(__dirname, '../package.json'))
      res.send(stream)
    })

    const { body, headers } = await request(handler).get('/')

    expect(body.toString()).toContain('@nautilus/micro')
    expect(headers['content-type']).toBe('application/octet-stream')
  })

  it('handles json responses', async () => {
    const handler = withResponse((req, res) => res.send({ hello: 'world' }))
    const { body, headers } = await request(handler).get('/')

    expect(body.hello).toBe('world')
    expect(headers['content-type']).toBe('application/json; charset=utf-8')
  })
})
