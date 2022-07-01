import CalendarService from './calendarService'
import NotificationService from './notificationService'
import NotificationCookieService from './notificationCookieService'
import UserAuthenticationService from './userAuthenticationService'

export const services = () => {
  const calendarService = new CalendarService()
  const notificationService = new NotificationService()
  const notificationCookieService = new NotificationCookieService()
  const userAuthenticationService = new UserAuthenticationService()

  return {
    calendarService,
    notificationService,
    notificationCookieService,
    userAuthenticationService,
  }
}

export type Services = ReturnType<typeof services>

export { CalendarService, NotificationService, NotificationCookieService, UserAuthenticationService }
