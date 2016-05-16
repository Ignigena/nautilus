const _ = require('lodash');
const crypto = require('crypto');

module.exports = function generateSecret() {
  var factors = _.shuffle([
    new Date().getTime() * Math.random(),
    Math.random() * 1000,
    process.version,
    process.env.pid
  ]);

  return crypto.createHash('md5').update(factors.join()).digest('hex');
};
