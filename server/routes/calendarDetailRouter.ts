import { RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import CalendarDetailController from '../controllers/calendarDetailController'

export default function calendarDetailRouter(router: Router): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  get('/details/:date([0-9]{4}-[0-9]{2}-[0-9]{2})', new CalendarDetailController().details)
  return router
}
