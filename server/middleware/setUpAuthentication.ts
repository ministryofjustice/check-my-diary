import type { Router } from 'express'
import express from 'express'
import passport from 'passport'
import flash from 'connect-flash'
import config from '../config'
import { init } from '../authentication/auth'

const router = express.Router()

export default function setUpAuth(): Router {
  init()

  router.use(passport.initialize())
  router.use(passport.session())
  router.use(flash())

  const authUrl = config.apis.hmppsAuth.externalUrl
  const authParameters = `client_id=${config.apis.hmppsAuth.apiClientId}&redirect_uri=${config.app.url}`
  const authLogoutUrl = `${authUrl}/logout?${authParameters}`

  router.get('/autherror', (req, res) => {
    res.status(401)
    return res.render('autherror.njk', {
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
      req.logout(err => {
        if (err) return next(err)
        return req.session.destroy(() => res.redirect(authLogoutUrl))
      })
    } else res.redirect(authLogoutUrl)
  })

  router.use('/account-details', (req, res) => {
    res.redirect(`${authUrl}/account-details?${authParameters}`)
  })

  router.use((req, res, next) => {
    res.locals.user = req.user
    next()
  })

  return router
}
