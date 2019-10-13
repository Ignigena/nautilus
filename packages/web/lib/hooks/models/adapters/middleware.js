const _ = require('lodash')

module.exports = schema => function (hook, type) {
  const hookDetails = new RegExp(/(pre|post)(.*)/g).exec(type)
  const when = hookDetails[1]
  const what = hookDetails[2].charAt(0).toLowerCase() + hookDetails[2].slice(1)

  if (!Array.isArray(hook)) {
    hook = [hook]
  }

  _.each(hook, function (middleware) {
    schema[when](what, middleware)
  })
}
