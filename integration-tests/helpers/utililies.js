const moment = require('moment')
const CalendarPage = require('../pages/calendarPage')

function gotoPreviousCalendarDate(date){
    const calendarPage = CalendarPage.verifyOnPage(moment().format('MMMM YYYY'))

    const now = new Date()

    const monthDifference = moment([now.getFullYear(), `0${now.getMonth() + 1}`.slice(-2), '01'].join('-')).diff(
      new Date(date),
      'months',
      true,
    )

    for (let x = 1; x <= monthDifference; x += 1) {
      const month = calendarPage.previousMonth(
        moment().subtract(x, 'months').startOf('month').format('YYYY-MM-DD'),
      )
      month.click()
    }
  }

  module.exports = {
    gotoPreviousCalendarDate,
  }