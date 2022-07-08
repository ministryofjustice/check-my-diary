import type { Router } from 'express'
import express from 'express'
import passport from 'passport'
import flash from 'connect-flash'
import config from '../config'
import { init } from '../authentication/auth'
import UserAuthenticationService from '../services/userAuthenticationService'

const router = express.Router()

export default function setUpAuth(userAuthenticationService: UserAuthenticationService): Router {
  init()

  router.use(passport.initialize())
  router.use(passport.session())
  router.use(flash())

  const authUrl = config.apis.hmppsAuth.externalUrl
  const authLogoutUrl = `${authUrl}/logout?client_id=${config.apis.hmppsAuth.apiClientId}&redirect_uri=${config.app.url}`

  router.get('/autherror', (req, res) => {
    res.status(401)
    return res.render('autherror', {
      authURL: authLogoutUrl,
    })
  })

  router.get('/login', passport.authenticate('oauth2'))

  router.get('/login/callback', (req, res, next) =>
    passport.authenticate('oauth2', {
      successReturnToOrRedirect: req.session.returnTo || '/',
      failureRedirect: '/autherror',
    })(req, res, next),
  )

  router.use('/logout', async (req, res, next) => {
    if (req.user) {
      await userAuthenticationService.updateSessionExpiryDateTime(req.user.username)

      req.logout((err) => {
        if (err) return next(err)
        return req.session.destroy(() => res.redirect(authLogoutUrl))
      })
    } else res.redirect(authLogoutUrl)
  })

  router.use('/account-details', (req, res) => {
    res.redirect(`${authUrl}/account-details`)
  })

  router.use((req, res, next) => {
    res.locals.user = req.user
    next()
  })

  return router
}
