const express = require('express');

module.exports = function staticHook(app) {
  const servePath = require('../util/getStaticPath')(app);
  app.use(express.static(servePath, app.config.static));
};
