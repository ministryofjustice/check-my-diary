import type { ShiftDto } from 'cmdApiClient'
import { asUser, RestClient } from '@ministryofjustice/hmpps-rest-client'
import logger from '../../logger'
import config from '../config'

export default class CalendarClient extends RestClient {
  constructor() {
    super('CMD Calendar API Client', config.apis.cmdApi, logger)
  }

  async getCalendarData(startDate: string, endDate: string, accessToken: string): Promise<Array<ShiftDto>> {
    return this.get(
      {
        path: '/user/details',
        query: { from: startDate, to: endDate },
      },
      asUser(accessToken),
    )
  }
}
