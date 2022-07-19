import axios from 'axios'
import type { ShiftDto } from 'cmdApiClient'
import { endOfMonth, format } from 'date-fns'
import logger from '../../log'
import baseUrl from '../config'
import getSanitisedError from '../sanitisedError'

export default class CalendarService {
  public async getCalendarMonth(startDate: string, accessToken: string): Promise<Array<ShiftDto>> {
    return this.getCalendarData(
      format(new Date(startDate), 'yyyy-MM-01'),
      CalendarService.getEndDate(startDate),
      accessToken,
    )
  }

  private async getCalendarData(startDate: string, endDate: string, accessToken: string): Promise<Array<ShiftDto>> {
    return axios
      .get(`${baseUrl.cmdApi.url}/user/details?from=${startDate}&to=${endDate}`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      })
      .then(({ data }) => data)
      .catch((error) => {
        const sanitisedError = getSanitisedError(error)
        logger.error(sanitisedError, `CalendarService Error: getCalendarData(${startDate}, ${endDate})`)
        throw sanitisedError
      })
  }

  private static getEndDate(startDate: string): string {
    return format(endOfMonth(new Date(startDate)), 'yyyy-MM-dd')
  }
}
