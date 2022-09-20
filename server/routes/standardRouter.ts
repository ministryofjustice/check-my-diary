import { Router } from 'express'
import csurf from 'csurf'
import auth from '../authentication/auth'
import populateCurrentUser from '../middleware/populateCurrentUser'
import tokenVerifier from '../data/tokenVerification'

const testMode = process.env.NODE_ENV === 'test'

export default function standardRouter(): Router {
  const router = Router({ mergeParams: true })

  router.use(auth.authenticationMiddleware(tokenVerifier))
  router.use(populateCurrentUser())

  // help users whose browsers remember this previously removed context
  router.use('/auth', (req, res) => res.redirect('/'))

  // CSRF protection
  if (!testMode) {
    router.use(csurf())
  }

  router.use((req, res, next) => {
    if (typeof req.csrfToken === 'function') {
      res.locals.csrfToken = req.csrfToken()
    }
    next()
  })

  return router
}
