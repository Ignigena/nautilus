module.exports = schema => function(method, name) {
  schema.query[name] = method;
};
