const logger = require('../../log.js')
const { GENERAL_ERROR } = require('../helpers/errorConstants')

// eslint-disable-next-line no-unused-vars
const errorsMiddleware = (error, req, res, next) => {
  logger.error(error)
  const { stack, status = 500, userMessage: message = GENERAL_ERROR } = error
  res.status(status)
  res.render('pages/error', { stack: process.env.NODE_ENV === 'production' ? null : stack, message, status })
}

module.exports = errorsMiddleware
