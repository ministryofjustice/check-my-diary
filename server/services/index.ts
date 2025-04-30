import { dataAccess } from '../data'

import CalendarService from './calendarService'
import NotificationService from './notificationService'
import NotificationCookieService from './notificationCookieService'
import UserService from './userService'

export const services = () => {
  const { applicationInfo, hmppsAuthClient, calendarClient, notificationClient } = dataAccess()

  const calendarService = new CalendarService(calendarClient)
  const notificationService = new NotificationService(notificationClient)
  const notificationCookieService = new NotificationCookieService()
  const userService = new UserService(hmppsAuthClient)

  return {
    applicationInfo,
    calendarService,
    notificationService,
    notificationCookieService,
    userService,
  }
}

export type Services = ReturnType<typeof services>

export { CalendarService, NotificationService, NotificationCookieService, UserService }
