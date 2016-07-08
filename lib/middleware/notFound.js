module.exports = function notFoundMiddleware(req, res) {
  res.notFound('Not found');
};
