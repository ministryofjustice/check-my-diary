const userAuthenticationService = require('../services/userAuthenticationService')

module.exports = async function authHandler(req, res, next) {
  const userSessionExpiryDateTime = await userAuthenticationService.getSessionExpiryDateTime(req.user.username)

  if (userSessionExpiryDateTime !== null && userSessionExpiryDateTime[0] != null) {
    if (new Date() > new Date(userSessionExpiryDateTime[0].SessionExpiryDateTime)) {
      res.redirect('/logout')
    } else {
      next()
    }
  }
}
