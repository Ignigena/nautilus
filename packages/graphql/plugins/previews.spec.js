const request = require('supertest')

const { gql, ApolloServer } = require('../')
const ApolloServerPreviews = require('./previews')

describe('plugins: preview', () => {
  beforeEach(() => jest.clearAllMocks())

  const resolver = jest.fn().mockImplementation((_, { name }) => `Hello ${name}!`)
  const testServer = new ApolloServer({
    typeDefs: gql`type Query { hello(name: String): String! }`,
    resolvers: {
      Query: {
        hello: resolver
      }
    },
    plugins: [ApolloServerPreviews({ vendorPrefix: 'github' })]
  }).createHandler()

  it('includes an additional `previews` attribute on the resolver context', async () => {
    const query = 'query { hello(name: "world") }'
    const { body: { data, errors } } = await request(testServer).post('/graphql').send({ query })

    expect(errors).not.toBeDefined()
    expect(data.hello).toBe('Hello world!')

    const [[, , context]] = resolver.mock.calls
    expect(context.previews).toBeDefined()
    expect(context.previews.size).toBe(0)
  })

  it('only considers the appropriate vendor prefix', async () => {
    const query = 'query { hello(name: "world") }'
    await request(testServer).post('/graphql')
      .set('Accept', ['application/vnd.github.octocat+json', 'application/vnd.nintendo.starfox+json'])
      .send({ query })

    const [[, , { previews }]] = resolver.mock.calls
    expect(previews.has('octocat')).toBe(true)
    expect(previews.has('starfox')).toBe(false)
  })
})
