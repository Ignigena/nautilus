const querystring = require('querystring')

// When multiple pages of results are returned, it is best practice to include
// a header describing the results along with the results themselves. This
// function can be used in a promise chain along with the `find` blueprint
// action to include basic count and pagination hints to your API consumers.
module.exports = app => async (results, query, req) => {
  const limit = query.options.limit
  const skip = query.options.skip
  const page = 1 + Math.floor(skip / limit) || 1

  // If this is a `findOne` request, no header is needed and we simply
  // return the first result so that it's not wrapped in an array.
  if (query._conditions._id) {
    return { data: results || null }
  }

  // Otherwise, the query is cloned to run a `count` operation and the
  // result is used to provide the pagination hints and count.
  const count = await query.lean().limit(0).skip(0).count()
  return {
    total: count,
    page,
    limit: limit,
    paging: {
      next: count - (page * limit) > 0 ? paginationUrl(page + 1, req) : null,
      previous: page > 1 ? paginationUrl(page - 1, req) : null,
      first: paginationUrl(1, req),
      last: paginationUrl(Math.ceil(count / limit) || 1, req)
    },
    data: results
  }
}

/**
 * For convenience, several pagination hints are provided along with the
 * response. Each pagination hint is customized to the current request
 * parameters so existing filters are retained when using the links.
 * @param {Number} page - The page number.
 * @param {Request} req - The Node request object.
 * @return {String} - The URL with appropriate parameters in the querystring.
 */
function paginationUrl (page, req) {
  let params = req.query
  params.page = page
  params = querystring.stringify(params)

  return `${req.originalUrl.split('?')[0]}?${params}`
}
