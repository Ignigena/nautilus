// Middleware: No Slash
// ===
// This middleware is provided primarily to prevent duplicate content in search
// engines. It is an alternative to the "slash" setting which enforces trailing
// slashes. This middleware will remove trailing slashes.
const url = require('url');

module.exports = function middlewareNoSlash(req, res, next) {
  // Only enforce trailing slash removal for `GET` and `HEAD` requests.
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();

  var requestUrl = url.parse(req.originalUrl);
  // Skip if this is a root request or the URL doesn't have a trailing slash.
  if (requestUrl.pathname.length <= 1 || !requestUrl.pathname.endsWith('/'))
    return next();

  // Otherwise, enforce the trailing slash removal and redirect immediately.
  res.redirect(`${requestUrl.pathname.slice(0, -1)}${requestUrl.search || ''}`);
};
