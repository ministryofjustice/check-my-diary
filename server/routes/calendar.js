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
    const { calendarService, calendarOvertimeService, notificationService, userAuthenticationService } = req.app.get(
      'DataServices',
    )

    try {
      const userAuthenticationDetails = await userAuthenticationService.getUserAuthenticationDetails(req.user.username)

      const notificationCount = await notificationService.countUnprocessedNotifications(req.user.token)

      const apiShiftsResponse = await calendarService.getCalendarData(
        userAuthenticationDetails[0].ApiUrl,
        req.params.date,
        req.user.token,
      )

      const apiOvertimeShiftsResponse = await calendarOvertimeService.getCalendarOvertimeData(
        userAuthenticationDetails[0].ApiUrl,
        req.params.date,
        req.user.token,
      )

      const results = utilities.processOvertimeShifts(apiShiftsResponse, apiOvertimeShiftsResponse)

      res.render('pages/calendar', {
        notificationCount,
        tab: 'Calendar',
        startDate: moment(req.params.date),
        data: results,
        uid: req.user.username,
        employeeName: req.user.employeeName,
        csrfToken: res.locals.csrfToken,
        hmppsAuthMFAUser: req.hmppsAuthMFAUser,
        authUrl: req.authUrl,
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
