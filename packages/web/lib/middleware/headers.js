const metadata = require('../../package.json')

module.exports = function middlewareHeaders (req, res, next) {
  res.setHeader('X-Powered-By', `Nautilus v${metadata.version}`)
  return next()
}
