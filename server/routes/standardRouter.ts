import { Router } from 'express'
import csurf from 'csurf'
import cmd2faSessionExpiry from '../middleware/cmd2faSessionExpiry'
import auth from '../authentication/auth'
import populateCurrentUser from '../middleware/populateCurrentUser'
import loginRouter from './login'

const testMode = process.env.NODE_ENV === 'test'

export function standardRouter(): Router {
  const router = Router({ mergeParams: true })

  router.use(auth.authenticationMiddleware())
  router.use(populateCurrentUser())

  // CMD 2FA functionality - only if user hasn't gone through HMPPS Auth 2FA
  router.use('/auth', loginRouter())
  router.use(cmd2faSessionExpiry)

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

export default {
  standardRouter,
}
