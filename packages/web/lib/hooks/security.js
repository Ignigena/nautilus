const cors = require('cors')
const lusca = require('lusca')

module.exports = NautilusCoreSecurity

NautilusCoreSecurity.prototype.order = -3

function NautilusCoreSecurity (app) {
  app.use(lusca(app.config.security))
  app.get('/_csrfToken', (req, res) => res.send(res.locals._csrf))

  app.use(cors(app.config.cors))
}
