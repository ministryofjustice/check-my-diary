const utilities = require('../helpers/utilities')
const asyncMiddleware = require('../middleware/asyncMiddleware')

module.exports = (logger, calService, calOvertimeService, DEPRECATEnotificationService, userAuthService) => (
  router,
) => {
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
      try {
        const userAuthenticationDetails = await userAuthService.getUserAuthenticationDetails(req.user.username)

        const shiftNotifications = await DEPRECATEnotificationService.getShiftNotifications(req.user.username)

        const apiShiftsResponse = await calService.getCalendarData(
          userAuthenticationDetails[0].ApiUrl,
          req.params.date,
          req.user.token,
        )

        const apiOvertimeShiftsResponse = await calOvertimeService.getCalendarOvertimeData(
          userAuthenticationDetails[0].ApiUrl,
          req.params.date,
          req.user.token,
        )

        const results = utilities.processOvertimeShifts(apiShiftsResponse, apiOvertimeShiftsResponse)

        res.render('pages/calendar', {
          shiftNotifications,
          tab: 'Calendar',
          startDate: req.params.date,
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

  return router
}
