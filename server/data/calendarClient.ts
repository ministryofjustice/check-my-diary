import type { ShiftDto } from 'cmdApiClient'
import { asSystem, AuthenticationClient, RestClient } from '@ministryofjustice/hmpps-rest-client'
import logger from '../../logger'
import config from '../config'

export default class CalendarClient extends RestClient {
  constructor(authenticationClient?: AuthenticationClient) {
    super('CMD Calendar API Client', config.apis.cmdApi, logger, authenticationClient)
  }

  async getCalendarData(startDate: string, endDate: string, username: string): Promise<Array<ShiftDto>> {
    return this.get(
      {
        path: '/user/details',
        query: { from: startDate, to: endDate },
      },
      asSystem(username),
    )
  }
}
