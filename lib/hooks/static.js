const express = require('express');

module.exports = function staticHook(app) {
  var servePath = require('../util/getStaticPath')(app);
  app.use(express.static(servePath));
};
