const { withMiddleware } = require('@nautilus/micro')
const {
  ApolloServerBase,
  convertNodeHttpToRequest,
  runHttpQuery
} = require('apollo-server-core')
const { serializeError } = require('serialize-error')

module.exports = class ApolloServer extends ApolloServerBase {
  serverlessFramework () {
    return true
  }

  createHandler () {
    this.ensureStarted()

    return withMiddleware(['cors', 'response', 'parse'])(async (req, res) => {
      try {
        const query = req.method === 'POST' ? req.body : req.query
        const { graphqlResponse, responseInit } = await runHttpQuery([req, res], {
          method: req.method,
          options: this.graphQLServerOptions({ req, res }),
          query,
          request: convertNodeHttpToRequest(req)
        })

        res.setHeaders(responseInit.headers)
        res.send(graphqlResponse)
      } catch (err) {
        if (err?.name === 'HttpQueryError') {
          if (err.headers) res.setHeaders(err.headers)
          return res.status(err.statusCode).send(err?.message)
        }

        res.status(500).json({ errors: [serializeError(err)] })
      }
    })
  }
}
