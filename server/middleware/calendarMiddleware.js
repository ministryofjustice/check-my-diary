const moment = require('moment')
const logger = require('../../log')
const { appendUserErrorMessage, configureCalendar, processDay } = require('../helpers/utilities')

const calendarMiddleware = async (req, res, next) => {
  logger.info('GET calendar view')

  const {
    app,
    user: { token, employeeName },
    params: { date },
    hmppsAuthMFAUser,
    authUrl,
  } = req

  const { calendarService } = app.get('DataServices')

  try {
    const notificationCount = 0

    const month = await calendarService.getCalendarMonth(date, token)
    month.forEach(processDay)
    const data = configureCalendar(month)
    const currentMonthMoment = moment(date)
    const previousMonthMoment = currentMonthMoment.clone().subtract('1', 'M')
    const nextMonthMoment = currentMonthMoment.clone().add('1', 'M')
    return res.render('pages/calendar', {
      ...res.locals,
      notificationCount,
      tab: 'Calendar',
      currentMonth: currentMonthMoment.format('MMMM YYYY'),
      previousMonth: { link: previousMonthMoment.format('YYYY-MM-DD'), text: previousMonthMoment.format('MMMM') },
      nextMonth: { link: nextMonthMoment.format('YYYY-MM-DD'), text: nextMonthMoment.format('MMMM') },
      data,
      employeeName,
      hmppsAuthMFAUser,
      authUrl,
    })
  } catch (error) {
    return next(appendUserErrorMessage(error))
  }
}

module.exports = calendarMiddleware
