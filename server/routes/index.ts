import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import calendarRouter from './calendarRouter'
import notificationRouter from './notificationRouter'
import calendarDetailRouter from './calendarDetailRouter'
import type { Services } from '../services'
import { setUpMaintenance } from '../middleware/setUpMaintenance'

export function indexRouter(router: Router, services: Services): Router {
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  router.use(setUpMaintenance())

  get('/', (req, res) => res.redirect('/calendar#today'))
  get('/contact-us', (req, res) => {
    res.render('pages/contact-us', {
      employeeName: req.user?.employeeName,
      csrfToken: res.locals.csrfToken,
      authUrl: req.authUrl,
    })
  })

  calendarRouter(router, services)
  calendarDetailRouter(router, services)
  notificationRouter(router, services)

  return router
}

export default {
  indexRouter,
}