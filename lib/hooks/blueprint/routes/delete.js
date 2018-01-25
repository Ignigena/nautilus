/**
 * Default blueprint functionality for `DELETE` requests. Will be used for
 * `delete` routes on the model unless controller defines functionality.
 * @param {Nautilus} app - The global app object.
 * @param {Object} model - The model configuration.
 * @return {Function} - Express-ready route with `req`uest and `res`ponse.
 */
module.exports = (app, model) => (req, res) => {
  if (app.api.controller[model] && app.api.controller[model].delete) {
    return app.api.controller[model].delete(req, res);
  }

  app.model(model).findByIdAndRemove(req.params.id).then(result => {
    // https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.7
    res.noContent();
  }).catch(err => {
    app.log.error(err);
    res.serverError(err);
  });
};
