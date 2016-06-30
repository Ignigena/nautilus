const url = require('url');

module.exports = function middlewareSlash(req, res, next) {
  // Only enforce trailing slashes for `GET` and `HEAD` requests.
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();

  var requestUrl = url.parse(req.originalUrl);
  // If the URL already has a trailing slash, or if it looks like it might be a
  // file, don't add a trailing slash.
  if (requestUrl.pathname.slice(-1) === '/' || requestUrl.pathname.slice(-5).indexOf('.') >= 0)
    return next();

  // Otherwise, enforce the trailing slash and redirect immediately.
  res.redirect(`${requestUrl.pathname}/${requestUrl.search || ''}`);
};
