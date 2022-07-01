import axios from 'axios'
import moment from 'moment'
import type { ShiftDto } from 'cmdApiClient'
import logger from '../../log'
import baseUrl from '../../config'

export default class CalendarService {
  public async getCalendarMonth(startDate: string, accessToken: string): Promise<Array<ShiftDto>> {
    return this.getCalendarData(moment(startDate).format('YYYY-MM-01'), this.getEndDate(startDate), accessToken)
  }

  public async getCalendarDay(startDate: string, accessToken: string): Promise<ShiftDto> {
    return this.getCalendarMonth(startDate, accessToken).then((month: Array<ShiftDto>) =>
      month.find(({ date }) => startDate === date),
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
        logger.error(`CalendarService : getCalendarData(${startDate}, ${endDate}) Error : ${error}`)
        throw error
      })
  }

  private getEndDate(startDate: string): string {
    return moment(startDate).endOf('month').format('YYYY-MM-DD')
  }
}