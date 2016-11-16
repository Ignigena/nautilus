const _ = require('lodash');
const express = require('express');
const objectId = require('mongodb').ObjectID;

module.exports = NautilusCoreBlueprint;

function NautilusCoreBlueprint(app) {
  if (app.config.blueprints === false) return;

  _.each(app.api.model, function(settings, model) {
    var blueprintRouter = new express.Router();

    // Create
    // --
    blueprintRouter.post('/', (req, res) => {
      if (Object.keys(req.body).length < 1)
        return res.badRequest('record required');

      app.api.model[model].create(req.body)
        .then(record => res.created(record))
        .catch(err => res.serverError(err));
    });

    // Read
    // --
    blueprintRouter.get('/:id?', (req, res) => {
      // To query for records, a valid object ID is required.
      if (req.params.id && !objectId.isValid(req.params.id)) {
        return res.badRequest('valid id required');
      }

      const criteria = req.params.id ? { _id: req.params.id } : {};
      const operation = req.params.id ? 'findOne' : 'find';

      let query = app.api.model[model][operation](criteria);

      if (operation === 'find') {
        query.limit(req.query.limit || 30);
        query.sort(req.query.sort);
      }

      if (req.query.fields) {
        query.select(req.query.fields.replace(',', ' '));
      }

      query
        .then(results => res.json(results))
        .catch(err => res.serverError(err));
    });

    // Update
    // --
    blueprintRouter.put('/:id', (req, res) => {
      // For an update action to be performed, a valid object ID is required.
      if (!req.params.id || !objectId.isValid(req.params.id)) {
        return res.badRequest('valid id required');
      }
      app.api.model[model].findOne({ _id: req.params.id }).then(record => {
        if (Object.keys(req.body).length < 1) return res.ok(record);

        // It is bad practice to change the primary key of a record. You should
        // just drop and re-add the record in this case. The blueprint route
        // will refuse to change a record's primary key even if you try.
        if (req.body._id && req.body._id != record._id) {
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
    });

    // Destroy
    // --
    // @TODO

    app.use(`/${model}`, blueprintRouter);
  });
}

NautilusCoreBlueprint.prototype.order = 10;
