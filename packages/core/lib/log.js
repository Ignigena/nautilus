const { createLogger, format, transports } = require('winston')

module.exports = function NautilusCoreLogs (app) {
  app.log = createLogger({
    level: 'info',
    format: format.combine(
      format.colorize(),
      format.align(),
      format.printf(info => `${info.level}: ${info.message}`)
    ),
    transports: [
      new transports.Console()
    ],
    ...app.config.log
  })

  app.profile = type => {
    if (process.env.NODE_ENV === 'production') return
    app.log.profile(type)
  }
}
