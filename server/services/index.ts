import CalendarService from './calendarService'
import NotificationService from './notificationService'
import NotificationCookieService from './notificationCookieService'

export const services = () => {
  const calendarService = new CalendarService()
  const notificationService = new NotificationService()
  const notificationCookieService = new NotificationCookieService()

  return {
    calendarService,
    notificationService,
    notificationCookieService,
  }
}

export type Services = ReturnType<typeof services>

export { CalendarService, NotificationService, NotificationCookieService }
