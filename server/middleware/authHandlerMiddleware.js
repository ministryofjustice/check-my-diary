const moment = require('moment')
const logger = require('../../log')

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
    return next(new Error('There appears to be a problem with your account. Please contact customer services.'))
  }
}

module.exports = authHandler
