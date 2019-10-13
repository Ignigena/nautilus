// Middleware: Slash
// ===
// This middleware is provided primarily to prevent duplicate content in search
// engines. Current default behaviour is to remove the trailing slash. Trailing
// slashes can be enabled by configuring `app.config.slash`. Either behaviour
// will enforce a canonical URL whether with or without a slash.
// https://webmasters.googleblog.com/2010/04/to-slash-or-not-to-slash.html
const url = require('url')
const pathMatch = require('path-to-regexp')

module.exports = app => function middlewareSlash (req, res, next) {
  // Only enforce trailing slashes for `GET` and `HEAD` requests.
  if (req.method !== 'GET' && req.method !== 'HEAD') return next()

  // A whitelist is allowed which will skip slash rewriting for any paths which
  // match. By default, when slash is enabled, resource paths with a filename
  // will be automatically skipped. To include additional paths in the whitelist
  // simply add them to the `whitelist` key in ``app.config.slash`.
  if (app.config.slash && app.config.slash.whitelist) {
    const whitelistPass = app.config.slash.whitelist.every(path =>
      (req.originalUrl.slice(1).match(pathMatch(path)) === null))

    if (!whitelistPass) return next()
  }

  const requestUrl = url.parse(req.originalUrl)

  // Remove trailing slashes if `app.config.slash` or
  // `app.config.slash.trailing` is set to `false`.
  if (shouldRemoveTrailingSlashes(app.config)) {
    // Skip if this is a root request or the URL doesn't have a trailing slash.
    if (requestUrl.pathname.length <= 1 || !requestUrl.pathname.endsWith('/')) { return next() }

    // Otherwise, enforce the trailing slash removal and redirect immediately.
    res.redirect(301, `${requestUrl.pathname.slice(0, -1)}${requestUrl.search || ''}`)
    return
  }

  // The default behaviour is to enforce trailing slashes. If the URL already
  // has a trailing slash, or if it looks like it might be a file, don't add a
  // trailing slash.
  if (requestUrl.pathname.endsWith('/') || requestUrl.pathname.slice(-5).indexOf('.') >= 0) { return next() }

  // Otherwise, enforce the trailing slash and redirect immediately.
  res.redirect(301, `${requestUrl.pathname}/${requestUrl.search || ''}`)
}

/**
 * Determine whether or not trailing slashes should be removed or enforced. To
 * strip trailing slashes set `app.config.slash` or `app.config.slash.trailing`
 * to `false`. Whitelisting is allowed in either configuration.
 * @param {Object} config The `app.config` object.
 * @return {Bool} Whether trailing slashes should be removed.
 */
function shouldRemoveTrailingSlashes (config) {
  return (!config.slash || config.hooks.slash === false)
}
