import { Router } from 'express'

// const testMode = process.env.NODE_ENV === 'test'

export function standardRouter(): Router {
  //
  // // CSRF protection
  // if (!testMode) {
  //   router.use(csurf())
  // }
  //
  // router.use((req, res, next) => {
  //   if (typeof req.csrfToken === 'function') {
  //     res.locals.csrfToken = req.csrfToken()
  //   }
  //   next()
  // })

  return Router({ mergeParams: true })
}

export default {
  standardRouter,
}
