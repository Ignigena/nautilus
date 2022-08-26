/**
 * Inspired by GitHub's GraphQL Schema previews, customize the behaviour of resolvers
 * based on the presence of one or more custom media types in the `Accepts` header.
 * This allows for standardized client opt-in to beta or experimental API features.
 * Resolvers can check for previews using `context.previews.has`.
 * @param {Object} config
 * @param {String} config.vendorPrefix - The specific vendor prefix for your Graph.
 * For example, a value of `"github"` will only consider headers that follow the
 * pattern of `application/vnd.github.*+json`.
 * @returns {ApolloServerPlugin}
 */
module.exports = (config) => ({
  /**
   * @param {import("apollo-server-core").GraphQLRequestContext}
   */
  requestDidStart ({ request, context }) {
    context.previews = new Set()

    if (!request.http.headers || !request.http.headers.has('accept')) return

    const prefix = ['application/vnd', config?.vendorPrefix].filter(Boolean).join('.')
    const headers = request.http.headers.get('accept').split(', ').filter(header => header.startsWith(prefix) && header.endsWith('+json'))

    context.previews = new Set(headers.map(header => header.slice(prefix.length + 1, -5)))
  }
})
