const router = require('express').Router()
const moment = require('moment')
const utilities = require('../helpers/utilities')
const asyncMiddleware = require('../middleware/asyncMiddleware')
const logger = require('../../log')

function serviceUnavailable(req, res) {
  logger.error('Service unavailable')

  res.render('pages/index', {
    authError: false,
    csrfToken: res.locals.csrfToken,
  })
}
router.get(
  '/:date',
  asyncMiddleware(async (req, res) => {
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

      const results = utilities.processOvertimeShifts(apiShiftsResponse, apiOvertimeShiftsResponse)

      res.render('pages/calendar', {
        notificationCount,
        tab: 'Calendar',
        startDate: moment(params.date),
        data: results,
        uid: user.username,
        employeeName: user.employeeName,
        csrfToken: res.locals.csrfToken,
        hmppsAuthMFAUser,
        authUrl,
      })
    } catch (error) {
      serviceUnavailable(req, res)
    }
  }),
)

// eslint-disable-next-line func-names
router.get('*', function (req, res) {
  logger.info('Catch and redirect to current month view')
  res.redirect(`/calendar/${utilities.getStartMonth()}`)
})

module.exports = router
