/**
 * Default blueprint functionality for `POST` requests. Will be used for
 * `create` routes on the model unless controller defines functionality.
 * @param {Nautilus} app - The global app object.
 * @param {Object} model - The model configuration.
 * @return {Function} - Express-ready route with `req`uest and `res`ponse.
 */
module.exports = (app, model) => (req, res) => {
  if (app.api.controller[model] && app.api.controller[model].create) {
    return app.api.controller[model].create(req, res)
  }

  if (Object.keys(req.body).length < 1) {
    return res.badRequest('record required')
  }

  app.model(model).create(req.body)
    .then(record => res.created(record))
    .catch(err => res.serverError(err))
}
