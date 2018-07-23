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

    // @FIXME: This should be in controller / view
    if (parsedJSON.hasOwnProperty('calendar')) {
      for (let i = parsedJSON.calendar.length, len = 35; i < len; i++) {
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
