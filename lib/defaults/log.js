const winston = require('winston');

module.exports = {
  level: process.env.NODE_ENV === 'test' ? 'error' : 'info',
  transports: [
    new (winston.transports.Console)({ colorize: true }),
  ],
};
