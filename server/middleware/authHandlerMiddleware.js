const moment = require('moment')
const logger = require('../../log')
const { appendUserErrorMessage } = require('../helpers/utilities')
const { AUTHENTICATION_ERROR } = require('../helpers/errorConstants')

const authHandler = async ({ hmppsAuthMFAUser, app, user: { username } }, res, next) => {
  try {
    if (hmppsAuthMFAUser) return next()
    const {
      userAuthenticationService: { getSessionExpiryDateTime },
    } = app.get('DataServices')
    const userSessionExpiryDateTime = await getSessionExpiryDateTime(username)
    const [{ SessionExpiryDateTime }] = userSessionExpiryDateTime
    if (SessionExpiryDateTime && moment().isBefore(moment(SessionExpiryDateTime))) return next()
    return res.redirect('/auth/login')
  } catch (error) {
    logger.info(error)
    return next(appendUserErrorMessage(error, AUTHENTICATION_ERROR))
  }
}

module.exports = authHandler
