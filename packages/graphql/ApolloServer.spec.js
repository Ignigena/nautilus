const { runHttpQuery } = require('apollo-server-core')
const request = require('supertest')

const { gql, ApolloServer, UserInputError } = require('./')

jest.mock('apollo-server-core', () => ({
  ...jest.requireActual('apollo-server-core'),
  runHttpQuery: jest.fn().mockImplementation(jest.requireActual('apollo-server-core/dist/runHttpQuery').runHttpQuery)
}))

describe('plugins: config', () => {
  const resolver = jest.fn().mockImplementation((_, { name = 'anonymous' }) => `Hello ${name}!`)
  const testServer = new ApolloServer({
    typeDefs: gql`type Query { hello(name: String): String! }`,
    resolvers: {
      Query: {
        hello: resolver
      }
    }
  }).createHandler()

  it('creates an ApolloServer handler', async () => {
    const query = 'query { hello(name: "world") }'
    const { body: { data, errors }, statusCode } = await request(testServer).post('/graphql').send({ query })

    expect(statusCode).toBe(200)
    expect(errors).not.toBeDefined()
    expect(data.hello).toBe('Hello world!')
  })

  it('handles errors thrown inside a resolver', async () => {
    resolver.mockImplementationOnce(() => { throw new UserInputError() })
    const { body: { data, errors }, statusCode } = await request(testServer).post('/graphql').send({ query: 'query { hello }' })

    expect(statusCode).toBe(200)
    expect(data).toBeNull()
    expect(errors).toBeDefined()
    expect(errors[0].extensions.code).toBe('BAD_USER_INPUT')
  })

  it('handles invalid queries', async () => {
    const { body: { data, errors }, statusCode } = await request(testServer).post('/graphql').send({ query: 'invalid' })

    expect(statusCode).toBe(400)
    expect(data).not.toBeDefined()
    expect(errors).toBeDefined()
    expect(errors[0].extensions.code).toBe('GRAPHQL_PARSE_FAILED')
  })

  it('handles application errors thrown outside of apollo', async () => {
    runHttpQuery.mockRejectedValueOnce(Error('something broke'))

    const { body: { data, errors }, statusCode } = await request(testServer).post('/graphql').send({ query: 'query { hello }' })
    expect(statusCode).toBe(500)
    expect(data).not.toBeDefined()
    expect(errors).toBeDefined()
    expect(errors[0].message).toBe('something broke')
  })
})
