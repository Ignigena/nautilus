const _ = require('lodash');

module.exports = schema => function(hook, type) {
  let hookDetails = new RegExp(/(pre|post)(.*)/g).exec(type);
  let when = hookDetails[1];
  let what = hookDetails[2].charAt(0).toLowerCase() + hookDetails[2].slice(1);

  if (typeof hook !== 'array') {
    hook = [hook];
  }

  _.each(hook, function(middleware) {
    schema[when](what, middleware);
  });
};
