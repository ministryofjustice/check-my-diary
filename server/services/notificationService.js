const axios = require('axios')
const moment = require('moment')
const getSanitisedError = require('../sanitisedError')

const logger = require('../../log')
const baseUrl = require('../../config').cmdApi.url

const notificationService = {
  getNotifications(accessToken, processOnRead = true, unprocessedOnly = false) {
    return axios
      .get(`${baseUrl}/notifications?processOnRead=${processOnRead}&unprocessedOnly=${unprocessedOnly}`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => response.data)
      .catch((error) => {
        logger.error(getSanitisedError(error), 'notificationService getNotifications')
        throw error
      })
  },

  async countUnprocessedNotifications(accessToken) {
    const data = await notificationService.getNotifications(accessToken, false, true)
    return data.length
  },

  getPreferences(accessToken) {
    return axios
      .get(`${baseUrl}/preferences/notifications`, {
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
  },

  updatePreferences(accessToken, preference = 'none', email = '', sms = '') {
    logger.info(`updatePreferences to ${preference}, hasEmail: ${!!email}, hasSms: ${!!sms}`)
    return axios
      .put(
        `${baseUrl}/preferences/notifications/details`,
        { preference, email, sms },
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
  },

  updateSnooze(accessToken, snoozeUntil) {
    logger.info(`updateSnooze until ${snoozeUntil}`)
    return axios
      .put(
        `${baseUrl}/preferences/notifications/snooze`,
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
  },

  resumeNotifications(accessToken) {
    logger.info('resume notification')
    return notificationService.updateSnooze(accessToken, moment().format('YYYY-MM-DD'))
  },
}

module.exports = notificationService
