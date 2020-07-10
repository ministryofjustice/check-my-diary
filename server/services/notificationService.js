const axios = require('axios')
const logger = require('../../log')
const baseUrl = require('../../config').cmdApi.url

module.exports = {
  getPreferences(accessToken) {
    return axios
      .get(`${baseUrl}/preferences/notifications`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      })
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
}
