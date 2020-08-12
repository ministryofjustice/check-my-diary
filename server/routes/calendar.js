const router = require('express').Router()
const moment = require('moment')
const { appendUserErrorMessage, processOvertimeShifts, getStartMonth } = require('../helpers/utilities')
const logger = require('../../log')

router.get('/:date([0-9]{4}-[0-9]{2}-[0-9]{2})', async (req, res, next) => {
  logger.info('GET calendar view')

  const { app, user, params, hmppsAuthMFAUser, authUrl } = req

  const { calendarService, calendarOvertimeService, notificationService, userAuthenticationService } = app.get(
    'DataServices',
  )

  try {
    const userAuthenticationDetails = await userAuthenticationService.getUserAuthenticationDetails(user.username)

    const notificationCount = await notificationService.countUnprocessedNotifications(user.token)

    const apiShiftsResponse = await calendarService.getCalendarData(
      userAuthenticationDetails[0].ApiUrl,
      params.date,
      user.token,
    )

    const apiOvertimeShiftsResponse = await calendarOvertimeService.getCalendarOvertimeData(
      userAuthenticationDetails[0].ApiUrl,
      params.date,
      user.token,
    )

    const results = processOvertimeShifts(apiShiftsResponse, apiOvertimeShiftsResponse)

    res.render('pages/calendar', {
      notificationCount,
      tab: 'Calendar',
      startDate: moment(params.date),
      data: results,
      employeeName: user.employeeName,
      csrfToken: res.locals.csrfToken,
      hmppsAuthMFAUser,
      authUrl,
      moment,
    })
  } catch (error) {
    next(appendUserErrorMessage(error))
  }
})

// eslint-disable-next-line func-names
router.get('/', function (req, res) {
  logger.info('Catch and redirect to current month view')
  res.redirect(`/calendar/${getStartMonth()}`)
})

module.exports = router
