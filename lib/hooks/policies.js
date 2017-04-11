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
  }

  if (!app.config.policies) return;

  // The default policy is only applied when no other policies are assigned to a
  // particular route. The best use of the default policy is to set up a
  // catch-all policy with the highest level of restriction for anonymous users.
  let defaultPolicy;
  defaultPolicy = app.config.policies.default || app.config.policies['*'];

  _.each(app.config.policies, (policies, route) => {
    if (route === 'default' || route === '*') return;

    // By passing `false`, a policy is blacklisted. Unless another policy
    // overrides it at a more granular route level it will return `forbidden`.
    if (policies === false) {
      app.use(route, whitelistCheck((req, res) => res.forbidden()));
      return;
    }

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

  if (typeof defaultPolicy === 'undefined') return;

  app.use('*', (req, res, next) => {
    if (req.policy === true || whitelistPass(req.originalUrl)) return next();
    if (defaultPolicy === false) return res.forbidden();
    app.api.policies[defaultPolicy](req, res, next);
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
    req.policy = true;

    if (whitelistPass(req.originalUrl)) return next();

    policy(req, res, next);
  };
}

function whitelistPass(url) {
  return middlewareWhitelist.some(path => url.match(pathMatch(path)));
}

NautilusCorePolicies.prototype.order = -2;
