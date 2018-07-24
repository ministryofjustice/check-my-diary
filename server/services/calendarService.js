const fs = require('fs');

module.exports = function CalendarService() {

  /**
   * @TODO: Replace with API and sort resolve/reject
   * @returns {any}
   */
  function loadStub() {
    return JSON.parse(fs.readFileSync(__dirname + '/calendar.stub.json', 'utf8'));
  }

  /**
   *
   * @returns {*}
   */
  function getCalendarData() {
    const parsedJSON = loadStub();

    if (parsedJSON.hasOwnProperty('calendar')) {

      /*
      // Fixed layout
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const pad = days.indexOf(parsedJSON.calendar[0].day);

      for (let i = 0, len = pad; i < len; i++) {
        parsedJSON.calendar.unshift({
          'type': 'no-day'
        });
      }
      */

      const currentLen = parsedJSON.calendar.length;

      for (let i = currentLen, len = (currentLen > 35 ? 42 : 35); i < len; i++) {
        parsedJSON.calendar.push({
          'type': 'no-day'
        });
      }
    }

    return parsedJSON;
  }

  /**
   *
   * @param date
   * @returns {*}
   */
  function getCalendarDetails(date) {
    const parsedJSON = loadStub();

    if (parsedJSON.hasOwnProperty('calendar')) {
      const filtered = parsedJSON.calendar.filter((item) => {
        return item.date === date;
      });

      return filtered[0];
    }
  }

  return {
    getCalendarData,
    getCalendarDetails
  };
};
