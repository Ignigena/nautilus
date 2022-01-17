const { withMiddleware } = require('@nautilus/micro')
const {
  ApolloServerBase,
  convertNodeHttpToRequest,
  runHttpQuery
} = require('apollo-server-core')

module.exports = class ApolloServer extends ApolloServerBase {
  serverlessFramework () {
    return true
  }

  createHandler () {
    this.ensureStarted()

    return withMiddleware(['cors', 'response', 'parse'])(async (req, res) => {
      res.setHeaders = headers => Object.entries(headers).forEach(([header, value]) => res.setHeader(header, value))

      try {
        const { graphqlResponse, responseInit } = await runHttpQuery([req, res], {
          method: req.method,
          options: this.graphQLServerOptions({ req, res }),
          query: req.body,
          request: convertNodeHttpToRequest(req)
        })

        res.setHeaders(responseInit.headers)
        res.send(graphqlResponse)
      } catch (err) {
        if (err.name === 'HttpQueryError' && err.headers) {
          res.setHeaders(err.headers)
        }

        res.status(err.statusCode || 500).send(err.message)
      }
    })
  }
}
