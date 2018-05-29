const _ = require('lodash');

module.exports = schema => function(virtual, virtualName) {
  // If an object is returned, this is used as the virtual configuration.
  if (typeof virtual === 'object') {
    schema.virtual(virtualName, virtual);
    return;
  }

  // If only a getter is needed a single function can be passed. Otherwise,
  // a `set` and `get` key can be specified with their respective functions.
  if (typeof virtual === 'function') {
    virtual = { get: virtual };
  }
  _.each(virtual, function(func, type) {
    schema.virtual(virtualName)[type](func);
  });
};
