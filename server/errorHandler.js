const logger = require('../log.js')

// eslint-disable-next-line no-unused-vars
module.exports = (error, req, res, next) => {
  logger.error(error)

  res.locals.message = 'Something went wrong. The error has been logged. Please try again'

  res.status(error.status || 500)

  res.render('pages/error', { csrfToken: res.locals.csrfToken })
}