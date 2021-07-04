const camelcase = require('camelcase')
const mongoose = require('mongoose')
const schema = require('mongoose-shorthand')

let connection
async function connect ({ uri, options }) {
  if (connection) return connection

  connection = await mongoose.connect(uri, {
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

  // Prevent hot-reloading from crashing if Mongoose models are cached.
  mongoose.models = {}
  mongoose.modelSchemas = {}

  // Each model is initialized with application `config` for context.
  models = Object.entries(models).reduce((all, [model, schema]) => {
    all[model] = shorthand(camelcase(model, { pascalCase: true }), schema)
    return all
  }, {})

  return async (req, res, app = {}) => {
    if (!mongo.uri) return next(req, res, app)
    await connect(mongo)

    app.mongo = mongoose.connection.db
    app.model = (model) => (model && models[model]) || Object.keys(models)

    next(req, res, app)
  }
}
