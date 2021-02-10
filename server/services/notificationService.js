const axios = require('axios')
const moment = require('moment')

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
        logger.error(`notificationService getNotifications : ${error}`)
        throw error
      })
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
        logger.error(`notificationService getPreferences : ${error}`)
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
        logger.error(`notificationService updatePreferences : ${error}`)
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
        logger.error(`notificationService updateSnooze : ${error}`)
        throw error
      })
  },

  resumeNotifications(accessToken) {
    logger.info('resume notification')
    return notificationService.updateSnooze(accessToken, moment().format('YYYY-MM-DD'))
  },
}

module.exports = notificationService
