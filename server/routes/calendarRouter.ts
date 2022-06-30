import { RequestHandler, Router } from 'express'

import { getStartMonth } from '../helpers/utilities'
import asyncMiddleware from '../middleware/asyncMiddleware'
import CalendarController from '../controllers/calendarController'
import type { Services } from '../services'

import notificationDismissController from '../controllers/notificationDismissController'

export default function calendarRouter(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const calendarController = new CalendarController(services.calendarService)
  get('/calendar/:date([0-9]{4}-[0-9]{2}-[0-9]{2})', (req, res) => calendarController.getDate(req, res))

  get('/calendar', (req, res) => res.redirect(`/calendar/${getStartMonth()}`))

  router.post('/calendar/dismiss', notificationDismissController())

  return router
}
