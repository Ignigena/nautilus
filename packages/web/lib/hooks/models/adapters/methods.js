module.exports = schema => function (method, name) {
  schema.methods[name] = method
}
