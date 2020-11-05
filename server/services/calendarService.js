const axios = require('axios')
const moment = require('moment')
const logger = require('../../log')
const utilities = require('../helpers/utilities')
const baseUrl = require('../../config').cmdApi.url

module.exports = {
  getCalendarData(startDate, endDate, accessToken) {
    logger.info(`calendarService:getCalendarData(${startDate}, ${endDate})`)
    return axios
      .get(`${baseUrl}/user/details?from=${startDate}&to=${endDate}`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      })
      .then(({ data }) => data)
      .catch((error) => {
        logger.error(`CalendarService : getCalendarData(${startDate}, ${endDate}) Error : ${error}`)
        throw error
      })
  },

  getCalendarMonth(startDate, accessToken) {
    return this.getCalendarData(moment(startDate).format('YYYY-MM-01'), utilities.getEndDate(startDate), accessToken)
  },

  getCalendarDay(startDate, accessToken) {
    return this.getCalendarMonth(startDate, accessToken).then((month) => month.find(({ date }) => startDate === date))
  },
}
