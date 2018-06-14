const dot = require('dot-prop');
const _ = require('lodash');

module.exports = schema => function(virtual, virtualName) {
  // If a virtual property is defined on the model, automatically expose it in
  // when using `toJSON` and `toObject`. This behavior can be turned off by
  // simply setting the `virtuals` property to `false` in your model.
  _.each(['toJSON', 'toObject'], path => {
    let location = `options.${path}.virtuals`;
    let userDisabled = (dot.get(schema, location) === false);
    dot.set(schema, location, !userDisabled);
  });

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
