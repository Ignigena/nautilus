// Favicon
// =======
// Wrapper around [serve-favicon](https://npmjs.com/package/serve-favicon).
const fs = require('fs');
const path = require('path');
const favicon = require('serve-favicon');

// A default favicon is provided for functionality out of the box. This also
// prevents your application from recieving a large number of uncachable 404
// errors when browsers try to automatically resolve this file.
module.exports = function faviconHook(app) {
  const faviconPath = path.resolve(__dirname, '../resources/favicon.ico');
  const staticPath = require('../util/getStaticPath')(app);
  const appFavicon = path.resolve(staticPath, 'favicon.ico');

  // Check for the existence of a user-supplied favicon in the static files
  // directory. If one exists, this will be used in place of the default.
  fs.access(appFavicon, fs.R_OK, err => {
    if (!err) faviconPath = appFavicon;
    app.use(favicon(faviconPath));
  });
};
