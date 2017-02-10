const _ = require('lodash');
const pathMatch = require('path-to-regexp');
const requireAll = require('require-all');

module.exports = NautilusCorePolicies;

let middlewareWhitelist = [];

function NautilusCorePolicies(app) {
  app.api = app.api || {};
  try {
    app.api.policies = requireAll({ dirname: `${app.appPath}/api/policies` });
  } catch (e) {
    app.api.policies = {};
    return;
  }

  _.each(app.config.policies, (policies, route) => {
    // By passing `true`, a policy is whitelisted. All other policies, including
    // a wildcard `*` with more restrictive policies are ignored for this route.
    if (policies === true) {
      middlewareWhitelist.push(route);
      return;
    }

    if (typeof policies === 'string') {
      policies = [policies];
    }

    _.each(policies, policy =>
      app.use(route, whitelistCheck(app.api.policies[policy])));
  });
}

/**
 * Check the route against a known whitelist before applying the policy. Because
 * policies can be defined in any order this allows a more restrictive policy to
 * be overridden with `true` to allow all access regardless of other policies.
 * @param {Function} policy - The policy to apply if the whitelist check fails.
 * @return {Function} An Express-compatible middleware.
 */
function whitelistCheck(policy) {
  return function(req, res, next) {
    const whitelistPass = middlewareWhitelist.some(path =>
      req.originalUrl.match(pathMatch(path)));
    if (whitelistPass) return next();

    policy(req, res, next);
  };
}

NautilusCorePolicies.prototype.order = -2;
