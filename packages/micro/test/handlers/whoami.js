const { send } = require('micro')

module.exports = (req, res) => send(res, 200, `Hello ${(
  req.body || req.query || req.cookies
)?.who || 'anonymous'}!`)
