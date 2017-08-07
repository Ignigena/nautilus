module.exports = app => function middlewareValidId(req, res, next) {
  if (!app.models) return;
  console.log(req.get('id'));
};
