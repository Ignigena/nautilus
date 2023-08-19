const merge = require('./merge')

describe('merge', () => {
  it('adds keys to the target that do not exist', () => {
    const merged = merge({}, { foo: 'bar' }, { baz: 'bat' })
    expect(merged.foo).toBe('bar')
    expect(merged.baz).toBe('bat')
  })

  it('overwrites existing keys', () => {
    const merged = merge({ foo: 'bar' }, { foo: 'bat' })
    expect(merged.foo).toBe('bat')
  })

  it('merges nested objects into the target', () => {
    const merged = merge({
      db: { host: 'atlas.mongodb.com' }
    }, {
      db: { port: 27017 }
    })

    expect(merged.db.host).toBe('atlas.mongodb.com')
    expect(merged.db.port).toBe(27017)
  })

  it('overwrites keys within nested objects', () => {
    const merged = merge({
      db: { host: 'atlas.mongodb.com' }
    }, {
      db: {
        host: 'beta.atlas.mongodb.com',
        port: 27017
      }
    })

    expect(merged.db.host).toBe('beta.atlas.mongodb.com')
    expect(merged.db.port).toBe(27017)
  })

  it('concatenates array values', () => {
    const merged = merge({ multi: ['foo', 'bar'] }, { multi: ['bat', 'baz'] })
    expect(merged.multi).toHaveLength(4)
  })

  it('replaces arrays with other values', () => {
    const merged = merge({ multi: ['foo', 'bar'] }, { multi: true })
    expect(Array.isArray(merged.multi)).toBe(false)
    expect(merged.multi).toBe(true)
  })

  it('replaces other primitive types', () => {
    const merged = merge({ date: new Date() }, { date: { start: new Date() } })
    expect(merged.date.start).toBeDefined()
  })

  it('handles `null` values', () => {
    const merged = merge({
      source: null,
      target: true,
      object: null
    }, {
      source: true,
      target: null,
      object: { foo: 'bar' }
    })

    expect(merged.source).toBe(true)
    expect(merged.target).toBe(null)
    expect(merged.object.foo).toBe('bar')
  })

  it('preserves getters', () => {
    const merged = merge({
      get foo () {
        return 'bar'
      },
      bat: 'baz'
    }, {
      get bar () {
        return this.bat
      }
    })

    expect(merged.foo).toBe('bar')
    expect(merged.bar).toBe('baz')
  })

  it('preserves functions', () => {
    const merged = merge({ hello: 'world' }, {
      hello (name) {
        return `Hello ${name}!`
      }
    })

    expect(typeof merged.hello).toBe('function')
    expect(merged.hello('Ignigena')).toBe('Hello Ignigena!')
  })
})
