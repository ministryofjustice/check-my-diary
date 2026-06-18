import HmppsAuthClient from './hmppsAuthClient'
import CalendarClient from './calendarClient'
import NotificationClient from './notificationClient'
import applicationInfoSupplier from '../applicationInfo'

const applicationInfo = applicationInfoSupplier()

export const dataAccess = () => ({
  applicationInfo,
  hmppsAuthClient: new HmppsAuthClient(),
  calendarClient: new CalendarClient(),
  notificationClient: new NotificationClient(),
})

export type DataAccess = ReturnType<typeof dataAccess>

export { HmppsAuthClient }
