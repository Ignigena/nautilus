// Middleware: Slash
// ===
// This middleware is provided primarily to prevent duplicate content in search
// engines. Current default behaviour is to enforce the trailing slash. Trailing
// slashes can be disabled by setting `app.config.slash` to `false`. Either
// behaviour will enforce a canonical URL whether with or without a slash.
// https://webmasters.googleblog.com/2010/04/to-slash-or-not-to-slash.html
const url = require('url');
const pathMatch = require('path-to-regexp');

module.exports = app => function middlewareSlash(req, res, next) {
  // Only enforce trailing slashes for `GET` and `HEAD` requests.
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();

  // A whitelist is allowed which will skip slash rewriting for any paths which
  // match. By default, when slash is enabled, resource paths with a filename
  // will be automatically skipped. To include additional paths in the whitelist
  // simply add them to the `whitelist` key in ``app.config.slash`.
  if (app.config.slash && app.config.slash.whitelist) {
    var whitelistPass = app.config.slash.whitelist.every(path =>
      (req.originalUrl.slice(1).match(pathMatch(path)) === null));

    if (!whitelistPass) return next();
  }

  var requestUrl = url.parse(req.originalUrl);

  // Remove trailing slashes if `app.config.slash` is set to `false`.
  if (app.config.slash === false || (app.config.slash && app.config.slash.trailing === false)) {
    // Skip if this is a root request or the URL doesn't have a trailing slash.
    if (requestUrl.pathname.length <= 1 || !requestUrl.pathname.endsWith('/'))
      return next();

    // Otherwise, enforce the trailing slash removal and redirect immediately.
    res.redirect(`${requestUrl.pathname.slice(0, -1)}${requestUrl.search || ''}`);
    return;
  }

  // If the URL already has a trailing slash, or if it looks like it might be a
  // file, don't add a trailing slash.
  if (requestUrl.pathname.endsWith('/') || requestUrl.pathname.slice(-5).indexOf('.') >= 0)
    return next();

  // Otherwise, enforce the trailing slash and redirect immediately.
  res.redirect(`${requestUrl.pathname}/${requestUrl.search || ''}`);
};
