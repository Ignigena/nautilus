const camelcase = require('camelcase')
const mongoose = require('mongoose')
const schema = require('mongoose-shorthand')

mongoose.Promise = global.Promise

let connection
async function connect ({ uri, options }) {
  if (connection) return connection

  connection = await mongoose.createConnection(uri, {
    bufferCommands: false,
    bufferMaxEntries: 0,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ...options
  })

  return connection
}

module.exports = (next, config = {}) => {
  const { connections: { mongo = {} } = {} } = config
  let { models = {} } = config

  const shorthand = schema(config)

  // Each model is initialized with application `config` for context.
  models = Object.entries(models).reduce((all, [model, schema]) => {
    all[model] = shorthand(camelcase(model, { pascalCase: true }), schema)
    return all
  }, {})

  return async (req, res, app = {}) => {
    if (!mongo.uri) return next(req, res, app)
    await connect(mongo)

    app.mongo = mongoose
    app.model = (model) => (model && models[model]) || Object.keys(models)

    next(req, res, app)
  }
}
