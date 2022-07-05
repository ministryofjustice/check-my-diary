import CalendarService from './calendarService'
import NotificationService from './notificationService'
import NotificationCookieService from './notificationCookieService'
import UserAuthenticationService from './userAuthenticationService'
import UserService from './userService'
import HmppsAuthClient from '../data/hmppsAuthClient'

export const services = () => {
  const calendarService = new CalendarService()
  const notificationService = new NotificationService()
  const notificationCookieService = new NotificationCookieService()
  const userAuthenticationService = new UserAuthenticationService()
  const userService = new UserService(new HmppsAuthClient())

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
