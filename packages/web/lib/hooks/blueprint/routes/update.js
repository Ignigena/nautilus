/**
 * Default blueprint functionality for `PUT` requests. Will be used for
 * `update` routes on the model unless controller defines functionality.
 * For an update action to be performed, a valid ObjectID is required.
 * @param {Nautilus} app - The global app object.
 * @param {Object} model - The model configuration.
 * @return {Function} - Express-ready route with `req`uest and `res`ponse.
 */
module.exports = (app, model) => (req, res) => {
  if (!req.validate({ id: 'isMongoId' }).isValid) {
    return res.badRequest('valid id required');
  }

  if (app.api.controller[model] && app.api.controller[model].update) {
    return app.api.controller[model].update(req, res);
  }

  if (!req.params.id) {
    return res.badRequest('id required');
  }

  app.blueprint.update(model, req).then(result => {
    res.ok({ data: result });
  }).catch(err => {
    app.log.error(err);
    res.serverError(err);
  });
};
