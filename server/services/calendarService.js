const axios = require('axios')
const logger = require('../../log')
const utilities = require('../helpers/utilities')
// const baseUrl = require('../../config').cmdApi.url
const baseUrl = 'http://localhost:8080/'

module.exports = {
  getCalendarData(startDate, accessToken) {
    return axios
      .get(`${baseUrl}user/details?from=${startDate}&to=${utilities.getEndDate(startDate)}`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      })
      .then(({ data }) => data)
      .catch((error) => {
        logger.error(`CalendarService : getCalendarData Error : ${error}`)
        throw error
      })
  },

  getCalendarDetails(startDate, accessToken) {
    return axios
      .get(`${baseUrl}user/details?from=${startDate}&to=${utilities.getEndDate(startDate)}`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      })
      .then(({ data }) => data)
      .catch((error) => {
        logger.error(`CalendarService : getCalendarDetails Error : ${error}`)
        throw error
      })
  },
}
