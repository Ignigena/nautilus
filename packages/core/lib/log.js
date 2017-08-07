const winston = require('winston');

module.exports = function NautilusCoreLogs(app) {
  app.log = new winston.Logger(app.config.log);

  app.profile = type => {
    if (process.env.NODE_ENV === 'production') return;
    app.log.profile(type);
  };
};
