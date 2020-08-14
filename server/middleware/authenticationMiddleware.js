const jwtDecode = require('jwt-decode')
const { hmppsAuthMFAUser, appendUserErrorMessage } = require('../helpers/utilities')
const { AUTHENTICATION_ERROR } = require('../helpers/errorConstants')
const config = require('../../config')

const authenticationMiddleware = (req, res, next) => {
  try {
    if (req.isAuthenticated()) {
      const {
        user: { token },
      } = req
      req.authUrl = config.nomis.authUrl
      req.hmppsAuthMFAUser = hmppsAuthMFAUser(token)
      req.user.employeeName = jwtDecode(token).name
      return next()
    }
    req.session.returnTo = req.originalUrl
    return res.redirect('/login')
  } catch (error) {
    return next(appendUserErrorMessage(error, AUTHENTICATION_ERROR))
  }
}

module.exports = authenticationMiddleware
