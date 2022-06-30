import CalendarService from './calendarService'

export const services = () => {
  const calendarService = new CalendarService()

  return {
    calendarService,
  }
}

export type Services = ReturnType<typeof services>

export { CalendarService }
