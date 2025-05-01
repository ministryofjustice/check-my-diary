import type {
  NotificationDto,
  ShiftDto,
  UpdateNotificationDetailsRequest,
  UpdateSnoozeUntilRequest,
} from 'cmdApiClient'
import { asUser, RestClient, SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import logger from '../../logger'
import config from '../config'

export default class NotificationClient extends RestClient {
  constructor() {
    super('CMD Calendar API Client', config.apis.cmdApi, logger)
  }

  public async getNotifications(
    accessToken: string,
    processOnRead = true,
    unprocessedOnly = false,
  ): Promise<Array<NotificationDto>> {
    return this.get(
      {
        path: '/notifications',
        query: { processOnRead, unprocessedOnly },
      },
      asUser(accessToken),
    )
  }

  private handleNotFoundError<ErrorData>(
    path: string,
    method: string,
    error: SanitisedError<ErrorData>,
  ): NotificationDto {
    if (error.responseStatus === 404) {
      logger.info(`Returned null for 404 not found when calling ${this.name}: ${path}`)
      return {}
    }
    return this.handleError<NotificationDto, ErrorData>(path, method, error)
  }

  public async getPreferences(accessToken: string): Promise<NotificationDto> {
    return this.get({ path: '/preferences/notifications', errorHandler: this.handleNotFoundError }, asUser(accessToken))
  }

  public async updatePreferences(
    accessToken: string,
    preference: UpdateNotificationDetailsRequest['preference'],
    email: string,
    sms: string,
  ): Promise<ShiftDto> {
    return this.put(
      {
        path: '/preferences/notifications/details',
        data: { preference, email, sms },
      },
      asUser(accessToken),
    )
  }

  public async updateSnooze(
    accessToken: string,
    snoozeUntil: UpdateSnoozeUntilRequest,
  ): Promise<UpdateNotificationDetailsRequest> {
    return this.put({ path: '/preferences/notifications/snooze', data: { snoozeUntil } }, asUser(accessToken))
  }
}
