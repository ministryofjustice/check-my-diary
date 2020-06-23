const passport = require('passport')
const { Strategy } = require('passport-oauth2')
const config = require('../../config')
const { generateOauthClientToken } = require('./oauth')

function authenticationMiddleware() {
  // eslint-disable-next-line
  return (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }

    req.session.returnTo = req.originalUrl
    return res.redirect('/login')
  }
}

passport.serializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user)
})

passport.deserializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user)
})

function init(signInService) {
  const strategy = new Strategy(
    {
      authorizationURL: `${config.nomis.authExternalUrl}/oauth/authorize`,
      tokenURL: `${config.nomis.authUrl}/oauth/token`,
      clientID: config.nomis.apiClientId,
      clientSecret: config.nomis.apiClientSecret,
      callbackURL: `${config.app.url}/login/callback`,
      state: true,
      customHeaders: { Authorization: generateOauthClientToken() },
    },
    // eslint-disable-next-line camelcase
    (accessToken, refreshToken, { expires_in, sub }, profile, done) => {
      const user = signInService.getUser(accessToken, refreshToken, expires_in, sub)

      return done(null, user)
    },
  )

  passport.use(strategy)
}

module.exports.init = init
module.exports.authenticationMiddleware = authenticationMiddleware
