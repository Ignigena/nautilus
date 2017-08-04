const querystring = require('querystring');

const _ = require('lodash');
const MongoQS = require('mongo-querystring');
const objectId = require('mongodb').ObjectID;
const qs = new MongoQS({
  blacklist: {
    fields: true,
    limit: true,
    page: true,
    sort: true,
  },
});

module.exports = NautilusCoreBlueprint;

function NautilusCoreBlueprint(app) {
  // While blueprints can be successful when rapidly prototyping an application,
  // the core logic can be re-used in your own routes. Currently, the `find`
  // blueprint helpers is available which parses the request parameters in order
  // to build an appropriate query.
  app.blueprint.find = function blueprintFind(model, criteria, req) {
    const operation = criteria && criteria._id ? 'findOne' : 'find';
    let query = app.model(model)[operation](criteria);

    if (operation === 'find') {
      query.limit(Number(req.query.limit) || 30);

      if (req.query.page && req.query.page > 1) {
        query.skip((req.query.page - 1) * query.options.limit);
      }

      query.sort(req.query.sort);
    }

    let validPaths = Object.keys(app.model(model).schema.paths);
    let validParams = _.pick(req.query, validPaths);
    query.find(qs.parse(validParams));

    if (req.query.fields) {
      query.select(req.query.fields.replace(',', ' '));
    }

    return query;
  };

  // When multiple pages of results are returned, it is best practice to include
  // a header describing the results along with the results themselves. This
  // function can be used in a promise chain along with the `find` blueprint
  // action to include basic count and pagination hints to your API consumers.
  app.blueprint.format = function blueprintFormat(results, query, req) {
    let limit = query.options.limit;
    let skip = query.options.skip;
    let page = 1 + Math.floor(skip / limit) || 1;

    // For convenience, several pagination hints are provided along with the
    // response. Each pagination hint is customized to the current request
    // parameters so existing filters are retained when using the links.
    function paginationUrl(page) {
      let params = req.query;
      params.page = page;
      params = querystring.stringify(params);

      return `${req.originalUrl.split('?')[0]}?${params}`;
    }

    return new Promise((resolve, reject) => {
      // If this is a `findOne` request, no header is needed and we simply
      // return the first result so that it's not wrapped in an array.
      if (query._conditions._id) return resolve({
        data: results[0] || null,
      });

      // Otherwise, the query is cloned to run a `count` operation and the
      // result is used to provide the pagination hints and count.
      query.lean().limit(0).skip(0).count(function(err, count) {
        if (err) return reject(err);

        resolve({
          total: count,
          page,
          limit: limit,
          paging: {
            next: count - (page * limit) > 0 ? paginationUrl(page + 1) : null,
            previous: page > 1 ? paginationUrl(page - 1) : null,
            first: paginationUrl(1),
            last: paginationUrl(Math.ceil(count / limit) || 1),
          },
          data: results,
        });
      });
    });
  };

  app.blueprint.update = function blueprintUpdate(model, req, criteria) {
    let findMethod = criteria && 'findOne' || 'findById';
    return app.model(model)[findMethod](criteria || req.params.id).then(record => {
      if (Object.keys(req.body).length < 1) return record;

      // It is bad practice to change the primary key of a record. Instead,
      // just drop and re-add the record. For this reason, thee blueprint
      // route will refuse to change a record's primary key even if you try.
      if (req.body._id && req.body._id !== record._id) {
        delete req.body._id;
        app.log.warn('Cannot change primary key value via blueprint.');
      }

      // Each update key that is sent over in the PUT request is applied to
      // the record before saving. In this case we are simply relying on
      // Mongoose to perform the model validations.
      for (let key in req.body) {
        if (req.body.hasOwnProperty(key)) {
          record[key] = req.body[key];
        }
      }

      return record.save();
    });
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

        if (app.api.controller[model]) {
          if (req.params.id && app.api.controller[model].findOne) {
            return app.api.controller[model].findOne(req, res);
          }

          if (!req.params.id && app.api.controller[model].find) {
            return app.api.controller[model].find(req, res);
          }
        }

        // To query for records, a valid object ID is required.
        if (req.params.id && !objectId.isValid(req.params.id)) {
          return res.badRequest('valid id required');
        }

        const criteria = req.params.id ? { _id: req.params.id } : {};

        let query = app.blueprint.find(model, criteria, req);

        query.then(results => app.blueprint.format(results, query, req))
          .then(formatted => {
            if (formatted.data.updatedAt) {
              let modified = new Date(formatted.data.updatedAt);
              res.setHeader('Last-Modified', modified.toUTCString());
            }
            res.ok(formatted);
          })
          .catch(err => res.serverError(err));
      })
      .post((req, res) => {
        // Create
        // --
        if (app.api.controller[model] && app.api.controller[model].create) {
          return app.api.controller[model].create(req, res);
        }

        if (Object.keys(req.body).length < 1)
          return res.badRequest('record required');

        app.model(model).create(req.body)
          .then(record => res.created(record))
          .catch(err => res.serverError(err));
      })
      .put((req, res) => {
        // Update
        // --
        // For an update action to be performed, a valid object ID is required.
        if (req.params.id && !objectId.isValid(req.params.id)) {
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
      })
      .delete((req, res, next) => {
        // Delete
        // --
        if (app.api.controller[model] && app.api.controller[model].delete) {
          return app.api.controller[model].delete(req, res);
        }

        // @TODO
        app.log.warn('Delete not yet implemented.');
        next();
      });
  });
}

NautilusCoreBlueprint.prototype.order = 10;
