import { Router } from 'express'
import csurf from 'csurf'
import cmd2faSessionExpiry from '../middleware/cmd2faSessionExpiry'

const testMode = process.env.NODE_ENV === 'test'

export function standardRouter(): Router {
  const router = Router({ mergeParams: true })

  // check my diary 2FA specific session expiry
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
