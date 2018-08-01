const axios = require('axios'),
  health = require('../controllers/health');

module.exports = function CalendarService() {

  const apiUrl = health.apiUrl;

  /**
   * Configures the calendar data to support a fixed layout (SUN, MON, TUE, WED, THU, FRI, SAT)
   * @param data
   * @returns {*}
   */
  function configureCalendar(data) {
    if (data.hasOwnProperty('calendar')) {

      // Insert blank days before the first date where necessary
      const pad = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(data.calendar[0].day);
      for (let i = 0, len = pad; i < len; i++) {
        data.calendar.unshift({
          'type': 'no-day'
        });
      }

      // Insert blank days after the last date where necessary
      const currentLen = data.calendar.length;
      for (let i = currentLen, len = currentLen > 35 ? 42 : 35; i < len; i++) {
        data.calendar.push({
          'type': 'no-day'
        });
      }
    }
    return data;
  }

  /**
   * Get the shift data for the given month (YYYY-MM-DD)
   * @param uid
   * @param startDate
   * @returns {Promise<any>}
   */
  function getCalendarData(uid, startDate) {

    // @TODO: This is here to support the API call but is this really needed?
    // Get the end date by retrieving the last date of the current month
    function getEndDate () {
      const splitDate = startDate.split('-');
      return `${splitDate[0]}-${splitDate[1]}-${new Date(splitDate[0], splitDate[1], 0).getDate()}`;
    }

    return new Promise((resolve, reject) => {
      axios.get(`${apiUrl}api/shifts/${uid}?start=${startDate}&end=${getEndDate()}`).then((response) => {
        resolve(configureCalendar(response.data));
      }).catch((error) => {
        reject(error);
      });
    });
  }

  /**
   * Get the shift details for the given date (YYYY-MM-DD)
   * @param uid
   * @param date
   * @returns {Promise<any>}
   */
  function getCalendarDetails(uid, date) {
    return new Promise((resolve, reject) => {
      axios.get(`${apiUrl}api/tasks/${uid}?date=${date}`).then((response) => {
        resolve(response.data.task);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  return {
    getCalendarData,
    getCalendarDetails
  };
};
