module.exports = function middlewareHeaders(req, res, next) {
  res.setHeader('X-Powered-By', 'Nautilus');
  return next();
};
