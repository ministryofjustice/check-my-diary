const moment = require('moment')

const authHandler = async ({ app, user: { username } }, res, next) => {
  try {
    const {
      userAuthenticationService: { getSessionExpiryDateTime },
    } = app.get('DataServices')
    const userSessionExpiryDateTime = await getSessionExpiryDateTime(username)
    if (
      !userSessionExpiryDateTime ||
      !userSessionExpiryDateTime[0] ||
      moment().isAfter(moment(userSessionExpiryDateTime[0].SessionExpiryDateTime))
    )
      return res.redirect('/auth/login')
    return next()
  } catch (error) {
    return next(error)
  }
}

module.exports = authHandler
