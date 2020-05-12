const axios = require('axios')
const logger = require('../../log')
const utilities = require('../helpers/utilities')

module.exports = function CalendarOvertimeService() {
  function getCalendarOvertimeData(apiUrl, uid, startDate, accessToken) {
    return new Promise((resolve, reject) => {
      axios
        .get(
          `${apiUrl}shifts/overtime/quantum/${uid}?startdate=${startDate}&enddate=${utilities.getEndDate(startDate)}`,
          {
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          },
        )
        .then((response) => {
          resolve(utilities.configureOvertimeCalendar(response.data, startDate))
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
  }

  function getCalendarOvertimeDetails(apiUrl, uid, date, accessToken) {
    return new Promise((resolve, reject) => {
      axios
        .get(`${apiUrl}shifts/overtime/quantum/${uid}/tasks?date=${date}`, {
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
  }

  return {
    getCalendarOvertimeData,
    getCalendarOvertimeDetails,
  }
}
