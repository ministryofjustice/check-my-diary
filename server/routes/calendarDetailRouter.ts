import { RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import CalendarDetailController from '../controllers/calendarDetailController'
import { Services } from '../services'

export default function calendarDetailRouter(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const calendarDetailsController = new CalendarDetailController(services.calendarService)
  get('/details/:date([0-9]{4}-[0-9]{2}-[0-9]{2})', (req, res) => calendarDetailsController.details(req, res))
  return router
}
