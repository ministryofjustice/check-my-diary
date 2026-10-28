import express, { Request, Response } from 'express'
import type { Router } from 'express'
import { AuditService } from '@ministryofjustice/hmpps-audit-client'

import utilities from '../helpers/utilities'
import CalendarController from '../controllers/calendarController'
import NotificationDismissController from '../controllers/notificationDismissController'
import type { CalendarService, NotificationCookieService, UserService } from '../services'

export default function calendarRouter(
  calendarService: CalendarService,
  notificationCookieService: NotificationCookieService,
  userService: UserService,
  auditService: AuditService,
): Router {
  const router = express.Router({ mergeParams: true })

  const calendarController = new CalendarController(
    calendarService,
    notificationCookieService,
    userService,
    auditService,
  )
  const notificationDismissController = new NotificationDismissController(notificationCookieService)

  router.get('/', (_: Request, res: Response) => res.redirect(`/calendar/${utilities.getStartMonth()}`))
  router.get('/:date', (req: Request, res: Response) => calendarController.getDate(req, res))
  router.post('/dismiss', (req: Request, res: Response) => notificationDismissController.dismiss(req, res))

  return router
}
