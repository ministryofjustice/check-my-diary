const config = require('../../config')

const authenticationMiddleware = (req, res, next) => {
  if (req.isAuthenticated()) {
    req.authUrl = config.nomis.authUrl
    return next()
  }

  req.session.returnTo = req.originalUrl
  return res.redirect('/login')
}

module.exports = authenticationMiddleware
