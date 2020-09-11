const moment = require('moment')
const logger = require('../../log')
const { appendUserErrorMessage, sortByDisplayType } = require('../helpers/utilities')

const calendarDetailMiddleware = async (
  { app, params: { date }, user: { token, employeeName }, hmppsAuthMFAUser, authUrl },
  res,
  next,
) => {
  logger.info('GET calendar details')

  const { calendarService } = app.get('DataServices')

  try {
    const {
      date: currentDate,
      fullDayType,
      fullDayTypeDescription,
      details: rawDetails,
    } = await calendarService.getCalendarDay(date, token)
    const todayMoment = moment(currentDate)
    const backLink = `/calendar/${todayMoment.clone().format('YYYY-MM-01')}`
    const yesterdayMoment = todayMoment.clone().subtract('1', 'd')
    const tomorrowMoment = todayMoment.clone().add('1', 'd')
    const details = rawDetails.filter(({ start, end }) => start !== end)
    if (details.length > 0) {
      sortByDisplayType(details, 'displayTypeTime')
      let lastStart
      details.forEach((detail, detailIndex) => {
        const { start, end, displayType, activity } = detail
        let startText = moment(start).format('HH:mm')
        const endText = end ? moment(end).format('HH:mm') : ''
        let processedActivity = activity
        let processedDisplayType = displayType ? displayType.toLowerCase() : ''
        if (['DAY_FINISH', 'OVERTIME_DAY_FINISH'].includes(displayType)) {
          if (lastStart === start) {
            startText = ''
            processedActivity = ''
          } else {
            details.splice(detailIndex + 1, 0, { displayType: processedDisplayType, end: endText })
            processedDisplayType = 'shift'
          }
        }

        lastStart = start
        Object.assign(detail, {
          start: startText,
          end: endText,
          displayType: processedDisplayType,
          activity: processedActivity,
        })
      })
    }
    res.render('pages/calendar-details', {
      ...res.locals,
      details,
      backLink,
      fullDayType,
      fullDayTypeDescription,
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
