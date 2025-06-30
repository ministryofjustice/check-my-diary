import express from 'express'
import type { Router } from 'express'

import calendarRouter from './calendarRouter'
import notificationRouter from './notificationRouter'
import type { Services } from '../services'
import setUpMaintenance from '../middleware/setUpMaintenance'

export default function routes({
  calendarService,
  notificationCookieService,
  notificationService,
  userService,
}: Services): Router {
  const router = express.Router({ mergeParams: true })

  router.use(setUpMaintenance())

  router.get('/', (req, res) => {
    req.session.fromDPS ||= !!req.query.fromDPS
    return res.redirect('/calendar#today')
  })
  router.get('/contact-us', (req, res) => {
    res.render('pages/contact-us.njk')
  })

  router.use('/calendar', calendarRouter(calendarService, notificationCookieService, userService))
  router.use('/notifications', notificationRouter(notificationService))

  return router
}
