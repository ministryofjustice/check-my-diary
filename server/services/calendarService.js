const axios = require('axios');

module.exports = function CalendarService() {

  const eliteApiUrl = process.env.API_ENDPOINT_URL || 'http://localhost:8080/';

  /**
   *
   * @returns {*}
   */
  function getCalendarData() {
    return axios.get(eliteApiUrl + 'api/shifts/');
  }

  /**
   *
   * @param date
   * @returns {*}
   */
  function getCalendarDetails(date) {
    return axios.get(eliteApiUrl + 'api/tasks/');
  }

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

  return {
    getCalendarData,
    configureCalendar,
    getCalendarDetails
  };
};
