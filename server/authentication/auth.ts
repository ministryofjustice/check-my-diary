import passport from 'passport'
import { Strategy } from 'passport-oauth2'

import config from '../../config'
import { generateOauthClientToken } from './oauth'

passport.serializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user)
})

passport.deserializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user as Express.User)
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function init({ signInService }: { signInService: any }): void {
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
  init,
}
