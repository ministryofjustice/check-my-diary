import CalendarService from './calendarService'
import NotificationService from './notificationService'

export const services = () => {
  const calendarService = new CalendarService()
  const notificationService = new NotificationService()

  return {
    calendarService,
    notificationService,
  }
}

export type Services = ReturnType<typeof services>

export { CalendarService, NotificationService }
