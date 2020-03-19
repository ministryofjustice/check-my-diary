const axios = require('axios')
const logger = require('../../log')

module.exports = function CalendarService() {
  /**
   * Configures the calendar data to support a fixed layout (SUN, MON, TUE, WED, THU, FRI, SAT)
   * @param data
   * @returns {*}
   */
  function configureCalendar(data) {
    if (data !== null && data.shifts.length > 0) {
      // Insert blank days before the first date where necessary
      const pad = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(
        getDayOfWeekString(data.shifts[0].startDateTime),
      )
      // eslint-disable-next-line no-plusplus
      for (let i = 0, len = pad; i < len; i++) {
        data.shifts.unshift({
          type: 'no-day',
        })
      }

      // Insert blank days after the last date where necessary
      const currentLen = data.shifts.length
      // eslint-disable-next-line no-plusplus
      for (let i = currentLen, len = currentLen > 35 ? 42 : 35; i < len; i++) {
        data.shifts.push({
          type: 'no-day',
        })
      }
    }

    return data
  }

  function getDayOfWeekString(date) {
    const dayOfWeek = new Date(date).getDay()
    // eslint-disable-next-line no-restricted-globals
    return isNaN(dayOfWeek)
      ? null
      : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]
  }

  /**
   * Get the shift data for the given month (YYYY-MM-DD)
   * @param uid
   * @param startDate
   * @returns {Promise<any>}
   */
  function getCalendarData(apiUrl, uid, startDate, accessToken) {
    // @TODO: This is here to support the API call but is this really needed?
    // Get the end date by retrieving the last date of the current month
    function getEndDate() {
      const splitDate = startDate.split('-')
      return `${splitDate[0]}-${splitDate[1]}-${new Date(splitDate[0], splitDate[1], 0).getDate()}`
    }

    return new Promise((resolve, reject) => {
      axios
        .get(`${apiUrl}shifts/quantum/${uid}?startdate=${startDate}&enddate=${getEndDate()}`, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
        .then(response => {
          resolve(configureCalendar(response.data))
        })
        .catch(error => {
          logger.error(`CalendarService : getCalendarData Error : ${error}`)
          if (error.response) {
            if (error.response.status === 404) {
              resolve(null)
            }
          } else {
            reject(error)
          }
        })
    })
  }

  /**
   * Get the shift details for the given date (YYYY-MM-DD)
   * @param uid
   * @param date
   * @returns {Promise<any>}
   */
  function getCalendarDetails(apiUrl, uid, date, accessToken) {
    return new Promise((resolve, reject) => {
      axios
        .get(`${apiUrl}shifts/quantum/${uid}/tasks?date=${date}`, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
        .then(response => {
          resolve(response.data)
        })
        .catch(error => {
          logger.error(`CalendarService : getCalendarData Error : ${error}`)
          if (error.response) {
            if (error.response.status === 404) {
              resolve(null)
            }
          } else {
            reject(error)
          }
        })
    })
  }

  return {
    getCalendarData,
    getCalendarDetails,
  }
}
