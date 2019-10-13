module.exports = app => async (model, req, criteria) => {
  const findMethod = (criteria && 'findOne') || 'findById'
  const record = await app.model(model)[findMethod](criteria || req.params.id)
  if (Object.keys(req.body).length < 1) return record

  // It is bad practice to change the primary key of a record. Instead,
  // just drop and re-add the record. For this reason, thee blueprint
  // route will refuse to change a record's primary key even if you try.
  if (req.body._id && req.body._id !== record._id) {
    delete req.body._id
    app.log.warn('Cannot change primary key value via blueprint.')
  }

  // Each update key that is sent over in the PUT request is applied to
  // the record before saving. In this case we are simply relying on
  // Mongoose to perform the model validations.
  for (const key in req.body) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      record[key] = req.body[key]
    }
  }

  return record.save()
}
