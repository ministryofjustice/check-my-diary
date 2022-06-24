import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import calendarRouter from './calendarRouter'

export function indexRouter(router: Router): Router {
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', (req, res) => res.redirect('/calendar#today'))
  get('/contact-us', (req, res) => {
    res.render('pages/contact-us', {
      employeeName: req.user?.employeeName,
      csrfToken: res.locals.csrfToken,
      authUrl: req.authUrl,
    })
  })

  calendarRouter(router)
  return router
}

export default {
  indexRouter,
}
