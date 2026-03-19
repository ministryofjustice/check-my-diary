import type {
  NotificationDto,
  ShiftDto,
  UpdateNotificationDetailsRequest,
  UpdateSnoozeUntilRequest,
} from 'cmdApiClient'
import { asSystem, AuthenticationClient, RestClient, SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import logger from '../../logger'
import config from '../config'

export default class NotificationClient extends RestClient {
  constructor(authenticationClient?: AuthenticationClient) {
    super('CMD Calendar API Client', config.apis.cmdApi, logger, authenticationClient)
  }

  public async getNotifications(
    username: string,
    processOnRead = true,
    unprocessedOnly = false,
  ): Promise<Array<NotificationDto>> {
    return this.get(
      {
        path: '/notifications',
        query: { processOnRead, unprocessedOnly },
      },
      asSystem(username),
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

  public async getPreferences(username: string): Promise<NotificationDto> {
    return this.get({ path: '/preferences/notifications', errorHandler: this.handleNotFoundError }, asSystem(username))
  }

  public async updatePreferences(
    username: string,
    preference: UpdateNotificationDetailsRequest['preference'],
    email: string,
    sms: string,
  ): Promise<ShiftDto> {
    return this.put(
      {
        path: '/preferences/notifications/details',
        data: { preference, email, sms },
      },
      asSystem(username),
    )
  }

  public async updateSnooze(
    username: string,
    snoozeUntil: UpdateSnoozeUntilRequest,
  ): Promise<UpdateNotificationDetailsRequest> {
    return this.put({ path: '/preferences/notifications/snooze', data: { snoozeUntil } }, asSystem(username))
  }
}
