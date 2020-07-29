const path = require('path')

const micro = require('micro')
const { utils } = require('@nautilus/micro')

const expect = require('expect')
const request = require('supertest')
const { nodeFileTrace: trace } = require('@zeit/node-file-trace')

const handler = require('../api/user')

describe('example: micro', () => {
  it('allows minimal config usage', () => request(micro(handler)).get('/').expect(200))

  it('loads correct configuration by default', () => {
    const config = utils.config(path.resolve(__dirname, '../config'))
    expect(config.models).toBeDefined()
    expect(config.greetings.hello).toBe('world')
    expect(config.README).not.toBeDefined()
  })

  it('traces properly for treeshaking on deployment', async () => {
    const { fileList } = await trace([path.resolve(__dirname, '../api/user/index.js')], { base: path.resolve(__dirname, '../../') })
    expect(fileList.filter(path => path.includes('config')).length >= 1).toBe(true)
  })
})
