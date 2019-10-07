const generateSecret = require('../util/generateSecret');

module.exports = {
  secret: generateSecret(),
  name: 'nautilus.sid',
  resave: false,
  saveUninitialized: false,
};
