module.exports = function middlewareSlash(req, res, next) {
  // Only enforce trailing slashes for `GET` and `HEAD` requests.
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();

  // If the URL already has a trailing slash, or if it looks like it might be a
  // file, don't add a trailing slash. @TODO: account for query strings.
  if (req.originalUrl.slice(-1) === '/' || req.originalUrl.slice(-5).indexOf('.') >= 0)
    return next();

  // Otherwise, enforce the trailing slash and redirect immediately.
  res.redirect(req.originalUrl + '/');
};
