const moment = require('moment')
const logger = require('../../log')
const { appendUserErrorMessage, sortByDate } = require('../helpers/utilities')

const calendarDetailMiddleware = async (
  { app, params: { date }, user: { token, employeeName }, hmppsAuthMFAUser, authUrl },
  res,
  next,
) => {
  logger.info('GET calendar details')

  const { calendarService } = app.get('DataServices')

  try {
    const { date: currentDate, fullDayType, tasks } = await calendarService.getCalendarDetails(date, token)
    const todayMoment = moment(currentDate)
    const backLink = `/calendar/${todayMoment.clone().format('YYYY-MM-01')}`
    const yesterdayMoment = todayMoment.clone().subtract('1', 'd')
    const tomorrowMoment = todayMoment.clone().add('1', 'd')
    sortByDate(tasks)
    tasks.forEach((task) => {
      const start = moment(task.start).format('HH:mm')
      const end = task.end ? moment(task.end).format('HH:mm') : ''
      Object.assign(task, { start, end })
    })
    res.render('pages/calendar-details', {
      ...res.locals,
      tasks,
      backLink,
      fullDayType,
      today: todayMoment.format('dddd, Do MMMM YYYY'),
      yesterday: { link: yesterdayMoment.format('YYYY-MM-DD'), text: yesterdayMoment.format('dddd, Do') },
      tomorrow: { link: tomorrowMoment.format('YYYY-MM-DD'), text: tomorrowMoment.format('dddd, Do') },
      employeeName,
      hmppsAuthMFAUser,
      authUrl,
      moment,
    })
  } catch (error) {
    next(appendUserErrorMessage(error))
  }
}

module.exports = calendarDetailMiddleware
