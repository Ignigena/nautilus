/**
 * Default blueprint functionality for `GET` requests. Will be used for both
 * `findOne` and `find`(Many) routes on the model unless the functionality
 * is defined on the controller.
 * @param {Nautilus} app - The global app object.
 * @param {Object} model - The model configuration.
 * @return {Function} - Express-ready route with `req`uest and `res`ponse.
 */
module.exports = (app, model) => (req, res) => {
  if (app.api.controller[model]) {
    if (req.params.id && app.api.controller[model].findOne) {
      return app.api.controller[model].findOne(req, res);
    }

    if (!req.params.id && app.api.controller[model].find) {
      return app.api.controller[model].find(req, res);
    }
  }

  // To query for records, a valid object ID is required.
  if (!req.validate({ id: 'isMongoId' }).isValid) {
    return res.badRequest('valid id required');
  }

  const criteria = req.params.id ? { _id: req.params.id } : {};

  let query = app.blueprint.find(model, criteria, req);

  query.then(results => app.blueprint.format(results, query, req))
  .then(formatted => {
    if (!formatted.data) {
      return res.notFound(formatted);
    }

    if (formatted.data.updatedAt) {
      let modified = new Date(formatted.data.updatedAt);
      res.setHeader('Last-Modified', modified.toUTCString());
    }
    res.ok(formatted);
  })
  .catch(err => res.serverError(err));
};
