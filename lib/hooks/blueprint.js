const _ = require('lodash');
const objectId = require('mongodb').ObjectID;

module.exports = NautilusCoreBlueprint;

function NautilusCoreBlueprint(app) {
  if (app.config.blueprint === false) return;

  // While blueprints can be successful when rapidly prototyping an application,
  // the core logic can be re-used in your own routes. Currently, the `find`
  // blueprint helpers is available which parses the request parameters in order
  // to build an appropriate query.
  app.api.model.find = function blueprintFind(model, criteria, req) {
    const operation = criteria._id ? 'findOne' : 'find';
    let query = app.api.model[model][operation](criteria);

    if (operation === 'find') {
      query.limit(req.query.limit || 30);
      query.skip(req.query.skip || 0);
      query.sort(req.query.sort);
    }

    if (req.query.fields) {
      query.select(req.query.fields.replace(',', ' '));
    }

    return query;
  };

  // For each model, a RESTful blueprint route is created for basic API
  // scaffolding. You can override any of the default blueprint actions in your
  // own controller or disable the blueprint routes on a per-model basis in
  // your application configuration.
  _.each(app.api.model, function(settings, model) {
    if (app.config.blueprint && app.config.blueprint[model] === false)
      return;

    app.route(`/${model}/:id?`)
      .get((req, res) => {
        // Read
        // --
        // To query for records, a valid object ID is required.
        if (req.params.id && !objectId.isValid(req.params.id)) {
          return res.badRequest('valid id required');
        }

        const criteria = req.params.id ? { _id: req.params.id } : {};

        app.api.model.find(model, criteria, req)
          .then(results => res.json(results))
          .catch(err => res.serverError(err));
      })
      .post((req, res) => {
        // Create
        // --
        if (Object.keys(req.body).length < 1)
          return res.badRequest('record required');

        app.api.model[model].create(req.body)
          .then(record => res.created(record))
          .catch(err => res.serverError(err));
      })
      .put((req, res) => {
        // Update
        // --
        // For an update action to be performed, a valid object ID is required.
        if (!req.params.id || !objectId.isValid(req.params.id)) {
          return res.badRequest('valid id required');
        }
        app.api.model[model].findOne({ _id: req.params.id }).then(record => {
          if (Object.keys(req.body).length < 1) return res.ok(record);

          // It is bad practice to change the primary key of a record. You should
          // just drop and re-add the record in this case. The blueprint route
          // will refuse to change a record's primary key even if you try.
          if (req.body._id && req.body._id !== record._id) {
            delete req.body._id;
            app.log.warn('Cannot change primary key value via blueprint.');
          }

          // Each update key that is sent over in the PUT request is applied to
          // the record before saving. In this case we are simply relying on
          // Mongoose to perform the model validations.
          for (var key in req.body) {
            if (req.body.hasOwnProperty(key)) {
              record[key] = req.body[key];
            }
          }

          return record.save().then(result => res.ok(result));
        }).catch(err => {
          app.log.error(err);
          res.serverError(err);
        });
      })
      .delete((req, res, next) => {
        // Destroy
        // --
        // @TODO
        app.log.warn('Delete not yet implemented.');
        next();
      });
  });
}

NautilusCoreBlueprint.prototype.order = 10;
