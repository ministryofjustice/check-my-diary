import { AuditServiceFactory } from '@ministryofjustice/hmpps-audit-client'
import { dataAccess } from '../data'

import CalendarService from './calendarService'
import NotificationService from './notificationService'
import NotificationCookieService from './notificationCookieService'
import UserService from './userService'
import logger from '../../logger'
import config from '../config'

export const services = () => {
  const { applicationInfo, hmppsAuthClient, calendarClient, notificationClient } = dataAccess()

  const auditService = AuditServiceFactory.createInstance(config.sqs.audit, logger)

  const calendarService = new CalendarService(calendarClient)
  const notificationService = new NotificationService(notificationClient)
  const notificationCookieService = new NotificationCookieService()
  const userService = new UserService(hmppsAuthClient)

  return {
    applicationInfo,
    auditService,
    calendarService,
    notificationService,
    notificationCookieService,
    userService,
  }
}

export type Services = ReturnType<typeof services>

export { CalendarService, NotificationService, NotificationCookieService, UserService }
