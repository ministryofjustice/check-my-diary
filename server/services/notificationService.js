const axios = require('axios')
const moment = require('moment')

const logger = require('../../log')
const baseUrl = require('../../config').cmdApi.url

const notificationService = {
  getNotifications(accessToken) {
    return axios
      .get(`${baseUrl}/notifications?unreadOnly=true`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => response.data)
      .catch((error) => {
        logger.error(`notificationService : ${error}`)
        return error
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
        logger.error(`notificationService : ${error}`)
        return error
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
        logger.error(`notificationService : ${error}`)
        return error
      })
  },

  resumeNotifications(accessToken) {
    logger.info('resume notification')
    return notificationService.updateSnooze(accessToken, moment().format('YYYY-MM-DD'))
  },
}

module.exports = notificationService
