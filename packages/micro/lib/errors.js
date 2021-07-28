module.exports = (next, config) => async (req, res, app) => {
  const handler = config?.errors?.handler(req, res) || app?.log?.error || console.error

  try {
    await next(req, res)
  } catch (err) {
    await handler(err)
    if (res.headersSent) return

    res.status(err.statusCode || 500).send(
      process.env.NODE_ENV === 'production'
        ? err.message
        : err.stack
    )
  }
}
