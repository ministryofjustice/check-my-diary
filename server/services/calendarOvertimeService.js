const axios = require('axios')
const logger = require('../../log')

module.exports = function CalendarOvertimeService() {
  /**
   * Configures the calendar data to support a fixed layout (SUN, MON, TUE, WED, THU, FRI, SAT)
   * @param data
   * @returns {*}
   */
  function getDaysInMonth(date){
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  function createDateTime(date){
    return new Date(date)
  }
  
  function configureCalendar(data) {

    const newData = {shifts: null}

    if (data !== null && data.shifts.length > 0) {   
      
      const convertedStartDateTime = createDateTime(data.shifts[0].startDateTime)
      const daysInMonth = getDaysInMonth(convertedStartDateTime)

      const startDate = new Date(convertedStartDateTime.getFullYear(), convertedStartDateTime.getMonth(), 1)

      // Insert blank days before the first date where necessary
      const pad = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(
        getDayOfWeekString(startDate),
      )      
      
      const newDataArray = []

      for(let x = 0; x <= daysInMonth-1; x++ ){        
        newDataArray.push({
          type: 'no-day',
          startDateTime: new Date(startDate.getFullYear(), startDate.getMonth(), x+1)
        })      
      }

      for(let x = 0; x <= data.shifts.length; x++ ){      
        if (data.shifts[x] !== undefined){          
          newDataArray[new Date(data.shifts[x].startDateTime).getDate()-1] = data.shifts[x]
        }        
      }
      
      newData.shifts = newDataArray

      // eslint-disable-next-line no-plusplus
      for (let i = 0, len = pad; i < len; i++) {
        newData.shifts.unshift({
          type: 'no-day',
        })        
      }

      // Insert blank days after the last date where necessary
      const currentLen = newData.shifts.length
      // eslint-disable-next-line no-plusplus
      for (let i = currentLen, len = currentLen > 35 ? 42 : 35; i < len; i++) {
        newData.shifts.push({
          type: 'no-day',
        })
      }
    }

    return newData
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
  function getCalendarOvertimeData(apiUrl, uid, startDate, accessToken) {
    // @TODO: This is here to support the API call but is this really needed?
    // Get the end date by retrieving the last date of the current month
    function getEndDate() {
      const splitDate = startDate.split('-')
      return `${splitDate[0]}-${splitDate[1]}-${new Date(splitDate[0], splitDate[1], 0).getDate()}`
    }

    return new Promise((resolve, reject) => {
      axios
        .get(`${apiUrl}shifts/overtime/quantum/${uid}?startdate=${startDate}&enddate=${getEndDate()}`, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          resolve(configureCalendar(response.data))
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

  /**
   * Get the shift details for the given date (YYYY-MM-DD)
   * @param uid
   * @param date
   * @returns {Promise<any>}
   */
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
