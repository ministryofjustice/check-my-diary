const { hmppsAuthMFAUser } = require('../helpers/utilities')
const config = require('../../config')

const authenticationMiddleware = (req, res, next) => {
  if (req.isAuthenticated()) {
    req.hmppsAuthMFAUser = hmppsAuthMFAUser(req.user.token)
    req.authUrl = config.nomis.authUrl
    return next()
  }

  req.session.returnTo = req.originalUrl
  return res.redirect('/login')
}

module.exports = authenticationMiddleware
