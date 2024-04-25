import type {
  NotificationDto,
  ShiftDto,
  UpdateNotificationDetailsRequest,
  UpdateSnoozeUntilRequest,
} from 'cmdApiClient'
import axios from 'axios'
import { format } from 'date-fns'
import getSanitisedError from '../sanitisedError'
import logger from '../../log'
import baseUrl from '../config'

export default class NotificationService {
  public async getNotifications(
    accessToken: string,
    processOnRead = true,
    unprocessedOnly = false,
  ): Promise<Array<NotificationDto>> {
    return axios
      .get(`${baseUrl.cmdApi.url}/notifications?processOnRead=${processOnRead}&unprocessedOnly=${unprocessedOnly}`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      })
      .then(response => response.data)
      .catch(error => {
        const sanitisedError = getSanitisedError(error)
        logger.error(sanitisedError, 'notificationService getNotifications')
        throw sanitisedError
      })
  }

  public async getPreferences(accessToken: string): Promise<NotificationDto> {
    return axios
      .get(`${baseUrl.cmdApi.url}/preferences/notifications`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      })
      .then(response => response.data)
      .catch(error => {
        if (error.response?.status === 404) {
          return {}
        }
        const sanitisedError = getSanitisedError(error)
        logger.error(sanitisedError, 'notificationService getPreference')
        throw sanitisedError
      })
  }

  public async updatePreferences(
    accessToken: string,
    preference: UpdateNotificationDetailsRequest['preference'],
    email: string,
    sms: string,
  ): Promise<ShiftDto> {
    logger.info(`updatePreferences to ${preference}, hasEmail: ${!!email}, hasSms: ${!!sms}`)
    return axios
      .put(
        `${baseUrl.cmdApi.url}/preferences/notifications/details`,
        { preference, email, sms },
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      )
      .catch(error => {
        const sanitisedError = getSanitisedError(error)
        logger.error(sanitisedError, 'notificationService updatePreferences')
        throw sanitisedError
      })
  }

  public async updateSnooze(
    accessToken: string,
    snoozeUntil: UpdateSnoozeUntilRequest,
  ): Promise<UpdateNotificationDetailsRequest> {
    logger.info(`updateSnooze until ${snoozeUntil}`)
    return axios
      .put(
        `${baseUrl.cmdApi.url}/preferences/notifications/snooze`,
        { snoozeUntil },
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      )
      .catch(error => {
        const sanitisedError = getSanitisedError(error)
        logger.error(sanitisedError, 'notificationService updateSnooze')
        throw sanitisedError
      })
  }

  public async resumeNotifications(accessToken: string): Promise<UpdateNotificationDetailsRequest> {
    logger.info('resume notification')
    return this.updateSnooze(accessToken, format(new Date(), 'yyyy-MM-dd'))
  }
}
