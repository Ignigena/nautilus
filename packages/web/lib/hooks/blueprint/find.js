const _ = require('lodash')
const MongoQS = require('mongo-querystring')
const qs = new MongoQS({
  blacklist: {
    fields: true,
    limit: true,
    page: true,
    sort: true
  }
})

// The `find` blueprint method parses the request parameters in order to build
// an appropriate query against the specified model. If the criteria includes an
// `_id`, `findById` will be used and a single document returned.
module.exports = app => (model, criteria, req) => {
  const operation = criteria && criteria._id ? 'findOne' : 'find'
  const query = app.model(model)[operation](criteria)

  if (operation === 'find') {
    query.limit(Number(req.query.limit) || 30)

    if (req.query.page && req.query.page > 1) {
      query.skip((req.query.page - 1) * query.options.limit)
    }

    query.sort(req.query.sort)

    const validPaths = Object.keys(app.model(model).schema.paths)
    const validParams = _.pick(req.query, validPaths)
    query.find(qs.parse(validParams))
  }

  if (req.query.fields) {
    query.select(req.query.fields.replace(',', ' '))
  }

  return query
}
