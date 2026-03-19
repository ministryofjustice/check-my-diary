import passport, { Profile } from 'passport'
import flash from 'connect-flash'
import { Router } from 'express'
import { Strategy as MicrosoftStrategy } from 'passport-microsoft'
import config from '../config'
import { PrisonUser } from '../interfaces/hmppsUser'

import { UserService } from '../services'
import AuthErrorType from '../interfaces/authErrorType'

function getAuthErrorDetail(type: AuthErrorType): string {
  switch (type) {
    case AuthErrorType.NO_MATCHING_USER:
      return 'No matching NOMIS user account is linked to your justice.gov.uk email. Please ensure your NOMIS account is active and linked to your justice.gov.uk email. For support please contact your LSA or the IT Helpdesk.'

    case AuthErrorType.MULTIPLE_MATCHING_USERS:
      return 'Multiple NOMIS user accounts match your justice.gov.uk email. Please contact your LSA or the IT Helpdesk.'

    case AuthErrorType.DEFAULT:
    default:
      return 'You are not authorised to use this application. Please contact the IT Helpdesk for support.'
  }
}

export default function setupAuthentication(userService: UserService) {
  passport.serializeUser((user, done) => {
    // Not used but required for Passport
    done(null, user)
  })

  passport.deserializeUser((user, done) => {
    // Not used but required for Passport
    done(null, user as Express.User)
  })

  passport.use(
    new MicrosoftStrategy(
      {
        clientID: config.entraId.clientId,
        clientSecret: config.entraId.clientSecret,
        callbackURL: config.entraId.callbackUrl,
        tenant: config.entraId.tenantId,
        scope: ['openid', 'profile', 'email', 'User.Read'],
      },
      (
        _accessToken: unknown,
        _refreshToken: unknown,
        profile: Profile,
        done: (error: unknown, user: unknown, info: object | undefined) => PrisonUser,
      ) => {
        userService.getActiveGeneralUsersMatchingMicrosoftProfile(profile).then(matchingUsers => {
          if (matchingUsers.length === 0) {
            return done(null, false, { message: AuthErrorType.NO_MATCHING_USER })
          }

          if (matchingUsers.length === 1) {
            return done(null, matchingUsers[0], {})
          }

          return done(null, false, { message: AuthErrorType.MULTIPLE_MATCHING_USERS })
        })
      },
    ),
  )

  const router = Router()

  router.use(passport.initialize())
  router.use(passport.session())
  router.use(flash())

  router.get('/autherror', (req, res) => {
    const errorType = req.flash('error')[0] as AuthErrorType | undefined
    const mappedErrorDetail = errorType ? getAuthErrorDetail(errorType) : getAuthErrorDetail(AuthErrorType.DEFAULT)

    if (errorType === AuthErrorType.MULTIPLE_MATCHING_USERS) {
      res.status(409)
    } else {
      res.status(401)
    }

    return res.render('autherror.njk', { errorDetails: mappedErrorDetail })
  })

  router.get('/sign-in', passport.authenticate('microsoft'))

  router.get('/sign-in/callback', (req, res, next) =>
    passport.authenticate('microsoft', {
      successReturnToOrRedirect: req.session.returnTo || '/',
      failureRedirect: '/autherror',
      failureFlash: true,
    })(req, res, next),
  )

  router.use('/sign-out', (req, res, next) => {
    if (req.user) {
      req.logout(err => {
        if (err) return next(err)
        return req.session.destroy(() => res.redirect('/sign-in'))
      })
    } else res.redirect('/sign-in')
  })

  router.use(async (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }
    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in')
  })

  router.use((req, res, next) => {
    res.locals.user = req.user as PrisonUser
    next()
  })

  return router
}
