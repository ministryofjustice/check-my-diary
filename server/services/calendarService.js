const fs = require('fs');

module.exports = function CalendarService() {

  function readJsonFileSync(filepath, encoding) {
    if (typeof (encoding) === 'undefined') {
      encoding = 'utf8';
    }

    const parsedJSON = JSON.parse(fs.readFileSync(filepath, encoding));

    // Ensure that there are 35 calendar blocks
    if (parsedJSON.hasOwnProperty('calendar')) {
      for (let i = parsedJSON.calendar.length, len = 35; i < len; i++) {
        parsedJSON.calendar.push({
          'type': 'no-day'
        });
      }
    }

    return parsedJSON;
  }

  function getCalendarData() {
    return readJsonFileSync(__dirname + '/calendar.stub.json');
  }

  return {
    getCalendarData
  };
};
