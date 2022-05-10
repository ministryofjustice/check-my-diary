const jwtDecode = require('jwt-decode')
const { hmppsAuthMFAUser, appendUserErrorMessage } = require('../helpers/utilities')
const config = require('../../config')

const authenticationMiddleware = (req, res, next) => {
  try {
    if (req.isAuthenticated()) {
      const {
        user: { token },
      } = req
      req.authUrl = config.apis.hmppsAuth.url
      req.hmppsAuthMFAUser = hmppsAuthMFAUser(token)
      req.user.employeeName = jwtDecode(token).name
      return next()
    }
    req.session.returnTo = req.originalUrl
    return res.redirect('/login')
  } catch (error) {
    return next(appendUserErrorMessage(error))
  }
}

module.exports = authenticationMiddleware
