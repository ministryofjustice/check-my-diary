import passport from 'passport'
import { Strategy } from 'passport-oauth2'
import { RequestHandler } from 'express'

import config from '../../config'
import generateOauthClientToken from './clientCredentials'
import { TokenVerifier } from '../data/tokenVerification'

passport.serializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user)
})

passport.deserializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user as Express.User)
})

export type AuthenticationMiddleware = (tokenVerifier: TokenVerifier) => RequestHandler

const authenticationMiddleware: AuthenticationMiddleware = (verifyToken) => {
  return async (req, res, next) => {
    if (req.isAuthenticated() && (await verifyToken(req))) {
      return next()
    }
    req.session.returnTo = req.originalUrl
    return res.redirect('/login')
  }
}

export function init(signInService: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getUser: (token: string, refreshToken: string, expiresIn: string, username: string) => any
}): void {
  const strategy = new Strategy(
    {
      authorizationURL: `${config.apis.hmppsAuth.externalUrl}/oauth/authorize`,
      tokenURL: `${config.apis.hmppsAuth.url}/oauth/token`,
      clientID: config.apis.hmppsAuth.apiClientId,
      clientSecret: config.apis.hmppsAuth.apiClientSecret,
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

export default {
  authenticationMiddleware,
  init,
}
