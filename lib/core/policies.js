const _ = require('lodash');
const requireAll = require('require-all');

module.exports = function policiesNautilus(app) {
  app.api = app.api || {};
  try {
    app.api.policies = requireAll({ dirname: `${app.appPath}/api/policies` });
  } catch (e) {
    app.api.policies = {};
    return;
  }

  _.each(app.config.policies, (policies, route) => {
    if (typeof policies === 'string') {
      app.use(route, app.api.policies[policies]);
      return;
    }

    _.each(policies, policy => app.use(route, app.api.policies[policy]));
  });
};
