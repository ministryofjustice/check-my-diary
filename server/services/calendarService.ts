import type { ShiftDto } from 'cmdApiClient'
import { endOfMonth, format } from 'date-fns'
import CalendarClient from '../data/calendarClient'

export default class CalendarService {
  constructor(private readonly calendarClient: CalendarClient) {}

  public async getCalendarMonth(startDate: string, accessToken: string): Promise<Array<ShiftDto>> {
    return this.calendarClient.getCalendarData(
      format(new Date(startDate), 'yyyy-MM-01'),
      CalendarService.getEndDate(startDate),
      accessToken,
    )
  }

  private static getEndDate(startDate: string): string {
    return format(endOfMonth(new Date(startDate)), 'yyyy-MM-dd')
  }
}
