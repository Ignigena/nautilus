/**
 * Inject environment-aware application configuration into the `context` argument.
 * Uses the `@nautilus/config` and any supported options can be passed on setup.
 * @param {Object} config
 * @param {String|Array<String>} config.path - Location of `config/` directory.
 * @returns {ApolloServerPlugin}
 */
module.exports = config => ({
  /**
   * @param {import("apollo-server-core").GraphQLRequestContext}
   */
  requestDidStart ({ request, context }) {
    const { path, ...options } = config
    context.config = require('@nautilus/config')(path, options)
  }
})
