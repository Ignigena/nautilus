// Middleware: Slash
// ===
// This middleware is provided primarily to prevent duplicate content in search
// engines. Current default behaviour is to enforce the trailing slash. Trailing
// slashes can be disabled by setting `app.config.slash` to `false`. Either
// behaviour will enforce a canonical URL whether with or without a slash.
// https://webmasters.googleblog.com/2010/04/to-slash-or-not-to-slash.html
const url = require('url');

module.exports = app => function middlewareSlash(req, res, next) {
  // Only enforce trailing slashes for `GET` and `HEAD` requests.
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();

  var requestUrl = url.parse(req.originalUrl);

  // Remove trailing slashes if `app.config.slash` is set to `false`.
  if (app.config.slash === false) {
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
