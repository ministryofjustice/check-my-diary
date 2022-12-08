import { dataAccess } from '../data'

import CalendarService from './calendarService'
import NotificationService from './notificationService'
import NotificationCookieService from './notificationCookieService'
import UserAuthenticationService from './userAuthenticationService'
import UserService from './userService'

export const services = () => {
  const { hmppsAuthClient } = dataAccess()

  const calendarService = new CalendarService()
  const notificationService = new NotificationService()
  const notificationCookieService = new NotificationCookieService()
  const userAuthenticationService = new UserAuthenticationService()
  const userService = new UserService(hmppsAuthClient)

  return {
    calendarService,
    notificationService,
    notificationCookieService,
    userAuthenticationService,
    userService,
  }
}

export type Services = ReturnType<typeof services>

export { CalendarService, NotificationService, NotificationCookieService, UserAuthenticationService, UserService }
