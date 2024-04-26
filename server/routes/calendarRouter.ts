import { RequestHandler, Router } from 'express'

import utilities from '../helpers/utilities'
import asyncMiddleware from '../middleware/asyncMiddleware'
import CalendarController from '../controllers/calendarController'
import NotificationDismissController from '../controllers/notificationDismissController'
import type { CalendarService, NotificationCookieService, UserService } from '../services'

export default function calendarRouter(
  router: Router,
  calendarService: CalendarService,
  notificationCookieService: NotificationCookieService,
  userService: UserService,
): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const calendarController = new CalendarController(calendarService, notificationCookieService, userService)
  const notificationDismissController = new NotificationDismissController(notificationCookieService)

  get('/calendar/:date([0-9]{4}-[0-9]{2}-[0-9]{2})', (req, res) => calendarController.getDate(req, res))

  get('/calendar', (req, res) => res.redirect(`/calendar/${utilities.getStartMonth()}`))

  router.post('/calendar/dismiss', (req, res) => notificationDismissController.dismiss(req, res))

  return router
}
