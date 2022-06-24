import { RequestHandler, Router } from 'express'

import { getStartMonth } from '../helpers/utilities'
import asyncMiddleware from '../middleware/asyncMiddleware'
import CalendarController from '../controllers/calendarController'

export default function calendarRouter(router: Router): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const calendarController = new CalendarController()
  get('/calendar/:date([0-9]{4}-[0-9]{2}-[0-9]{2})', calendarController.getDate)

  get('/calendar', (req, res) => res.redirect(`/calendar/${getStartMonth()}`))

  return router
}
