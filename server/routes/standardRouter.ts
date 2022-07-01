import { Router } from 'express'
import csurf from 'csurf'
import auth from '../authentication/auth'
import populateCurrentUser from '../middleware/populateCurrentUser'
import tokenVerifier from '../data/tokenVerification'
import loginRouter from './login'
import { UserAuthenticationService } from '../services'
import CmdSessionExpiry from '../middleware/cmd2faSessionExpiry'

const testMode = process.env.NODE_ENV === 'test'

export function standardRouter(userAuthenticationService: UserAuthenticationService): Router {
  const router = Router({ mergeParams: true })

  router.use(auth.authenticationMiddleware(tokenVerifier))
  router.use(populateCurrentUser())

  // CMD 2FA functionality - only if user hasn't gone through HMPPS Auth 2FA
  router.use('/auth', loginRouter(userAuthenticationService))
  router.use((req, res, next) => new CmdSessionExpiry(userAuthenticationService).cmd2faSessionExpiry(req, res, next))

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
