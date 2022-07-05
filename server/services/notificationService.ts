import type {
  NotificationDto,
  ShiftDto,
  UpdateNotificationDetailsRequest,
  UpdateSnoozeUntilRequest,
} from 'cmdApiClient'
import axios from 'axios'
import moment from 'moment'
import getSanitisedError from '../sanitisedError'
import logger from '../../logger'
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
      .then((response) => response.data)
      .catch((error) => {
        logger.error(getSanitisedError(error), 'notificationService getNotifications')
        throw error
      })
  }

  public async countUnprocessedNotifications(accessToken: string) {
    const data = await this.getNotifications(accessToken, false, true)
    return data.length
  }

  public async getPreferences(accessToken: string): Promise<NotificationDto> {
    return axios
      .get(`${baseUrl.cmdApi.url}/preferences/notifications2`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => response.data)
      .catch((error) => {
        if (error.response.status === 404) {
          return {}
        }
        logger.error(getSanitisedError(error), 'notificationService getPreference')
        throw error
      })
  }

  public async updatePreferences(
    accessToken: string,
    preference: UpdateNotificationDetailsRequest['preference'],
    email: string,
  ): Promise<ShiftDto> {
    logger.info(`updatePreferences to ${preference}, hasEmail: ${!!email}`)
    return axios
      .put(
        `${baseUrl.cmdApi.url}/preferences/notifications/details`,
        { preference, email, sms: '' },
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      )
      .catch((error) => {
        logger.error(getSanitisedError(error), 'notificationService updatePreferences')
        throw error
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
      .catch((error) => {
        logger.error(getSanitisedError(error), 'notificationService updateSnooze')
        throw error
      })
  }

  public async resumeNotifications(accessToken: string): Promise<UpdateNotificationDetailsRequest> {
    logger.info('resume notification')
    return this.updateSnooze(accessToken, moment().format('YYYY-MM-DD'))
  }
}
