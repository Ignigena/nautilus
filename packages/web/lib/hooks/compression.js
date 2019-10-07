const compression = require('compression');

module.exports = function compressionHook(app) {
  app.use(compression(app.config.compression));
};
