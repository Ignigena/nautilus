const loaders = require('@nautilus/config/loaders')
const request = require('supertest')

const { gql, ApolloServer } = require('../')
const ApolloServerConfig = require('./config')

jest.mock('@nautilus/config/loaders')

describe('plugins: config', () => {
  beforeEach(() => jest.clearAllMocks())

  const resolver = jest.fn().mockImplementation((_, { name }) => `Hello ${name}!`)
  const testServer = new ApolloServer({
    typeDefs: gql`type Query { hello(name: String): String! }`,
    resolvers: {
      Query: {
        hello: resolver
      }
    },
    plugins: [ApolloServerConfig({ path: './config' })]
  }).createHandler()

  it('includes an additional `config` attribute on the resolver context', async () => {
    loaders.default.mockReturnValue({ foo: 'bar' })

    const query = 'query { hello(name: "world") }'
    const { body: { data, errors } } = await request(testServer).post('/graphql').send({ query })

    expect(errors).not.toBeDefined()
    expect(data.hello).toBe('Hello world!')

    const [[, , context]] = resolver.mock.calls
    expect(context.config).toBeDefined()
    expect(context.config).toStrictEqual({ foo: 'bar' })
  })
})
