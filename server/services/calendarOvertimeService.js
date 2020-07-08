const axios = require('axios')
const logger = require('../../log')
const utilities = require('../helpers/utilities')

module.exports = {
  getCalendarOvertimeData(apiUrl, startDate, accessToken) {
    return new Promise((resolve, reject) => {
      axios
        .get(`${apiUrl}shifts/overtime?startdate=${startDate}&enddate=${utilities.getEndDate(startDate)}`, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          resolve(response.data, startDate)
        })
        .catch((error) => {
          if (error.response) {
            if (error.response.status === 404) {
              resolve(null)
            }
          } else {
            logger.error(`CalendarService : getCalendarOvertimeData Error : ${error}`)
            reject(error)
          }
        })
    })
  },

  getCalendarOvertimeDetails(apiUrl, date, accessToken) {
    return new Promise((resolve, reject) => {
      axios
        .get(`${apiUrl}shifts/overtime/tasks?date=${date}`, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          resolve(response.data)
        })
        .catch((error) => {
          if (error.response) {
            if (error.response.status === 404) {
              resolve(null)
            }
          } else {
            logger.error(`CalendarService : getCalendarOvertimeData Error : ${error}`)
            reject(error)
          }
        })
    })
  },
}
