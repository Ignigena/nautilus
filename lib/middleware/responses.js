module.exports = function middlewareResponses(req, res, next) {
  res.badRequest = status => res.status(400).send(status);
  res.created = status => res.status(201).send(status);
  res.forbidden = status => res.status(403).send(status);
  res.notFound = status => res.status(404).send(status);
  res.ok = status => res.status(200).send(status);
  res.redirect = (address, permanent) => {
    res.set('Location', address);
    return res.status(permanent ? 301 : 302).send();
  };
  res.serverError = status => res.status(500).send(status);

  return next();
};
