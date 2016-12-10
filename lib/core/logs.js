const _ = require('lodash');
const winston = require('winston');

module.exports = function logsNautilus(app) {
  app.log = new winston.Logger(_.merge({
    level: process.env.NODE_ENV === 'test' ? 'error' : 'info',
    transports: [
      new (winston.transports.Console)({ colorize: true })
    ]
  }, app.config.log));

  app.profile = type => {
    if (process.env.NODE_ENV === 'production') return;

    app.log.profile(type);
  };
};
