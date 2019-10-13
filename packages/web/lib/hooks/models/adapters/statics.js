module.exports = schema => function (method, name) {
  schema.statics[name] = method
}
