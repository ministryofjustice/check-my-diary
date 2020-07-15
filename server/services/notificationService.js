const axios = require('axios')
const logger = require('../../log')
const baseUrl = require('../../config').cmdApi.url

const notificationService = {
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
    return axios
      .put(`${baseUrl}/preferences/notifications/snooze`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        data: { snoozeUntil },
      })
      .catch((error) => {
        logger.error(`notificationService : ${error}`)
        return error
      })
  },

  resumeNotifications(accessToken) {
    console.log('in resume')
    return notificationService.updateSnooze(accessToken, new Date())
  },
}

module.exports = notificationService
