const axios = require('axios');

module.exports = function CalendarService() {

  const apiUrl = process.env.API_ENDPOINT_URL || 'http://localhost:8080/';

  /**
   *
   * @param data
   * @returns {*}
   */
  function configureCalendar(data) {
    if (data.hasOwnProperty('calendar')) {

      // Fixed layout
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        pad = days.indexOf(data.calendar[0].day);

      for (let i = 0, len = pad; i < len; i++) {
        data.calendar.unshift({
          'type': 'no-day'
        });
      }

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
   *
   * @param uid
   * @param startDate
   * @returns {Promise<any>}
   */
  function getCalendarData(uid, startDate) {
    return new Promise((resolve, reject) => {
      axios.get([apiUrl, 'api/shifts/', uid, '?start=', startDate].join('')).then((response) => {
        resolve(configureCalendar(response.data));
      }).catch((error) => {
        reject(error);
      });
    });
  }

  /**
   *
   * @param uid
   * @param date
   * @returns {Promise<any>}
   */
  function getCalendarDetails(uid, date) {
    return new Promise((resolve, reject) => {
      axios.get([apiUrl, 'api/tasks/', uid, '?date=', date].join('')).then((response) => {
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
