import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import calendarRouter from './calendarRouter'
import notificationRouter from './notificationRouter'
import type { Services } from '../services'
import setUpMaintenance from '../middleware/setUpMaintenance'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function routes({
  calendarService,
  notificationCookieService,
  notificationService,
  userService,
}: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  router.use(setUpMaintenance())

  get('/', (req, res) => {
    req.session.fromDPS ||= !!req.query.fromDPS
    return res.redirect('/calendar#today')
  })
  get('/contact-us', (req, res) => {
    res.render('pages/contact-us.njk')
  })

  calendarRouter(router, calendarService, notificationCookieService, userService)
  notificationRouter(router, notificationService)

  return router
}
