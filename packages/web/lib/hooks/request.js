const validator = require('validator')

module.exports = function NautilusHookRequest (app) {
  /**
   * Validate an incoming request before continuing. This comes built in to all
   * controller and routes created through Nautilus and can be configured using
   * the `validate` key on the route definition. For custom routes, you can call
   * req.validate() and handle the return value yourself.
   * @see https://www.npmjs.com/package/validator
   * @param {Object} rules - A key value object containing all the rules that
   * must pass in order for the request to continue. The key should match what
   * is present in `req.params`. Optional parameters are not validated. The
   * value may contain any number of validation rules that must pass.
   * @return {Object} - Validation result (pass/fail on `isValid` property)
   */
  app.request.validate = function (rules) {
    let result = { isValid: true }
    Object.keys(rules).forEach(param => {
      if (!this.params[param]) return
      if (!Array.isArray(rules[param])) rules[param] = [rules[param]]
      rules[param].forEach(validate => {
        const isValid = validator[validate](this.params[param])
        if (!isValid) result = { isValid: false, param, validate }
      })
    })
    return result
  }
}
