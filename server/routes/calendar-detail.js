const asyncMiddleware = require('../middleware/asyncMiddleware')

function serviceUnavailable(logger, req, res) {
  logger.error('Service unavailable')
  res.render('pages/index', {
    authError: false,
    csrfToken: res.locals.csrfToken,
  })
}

module.exports = (logger, userAuthenticationService) => (router) => {
  router.get(
    '/:date',
    asyncMiddleware(async (req, res) => {
      logger.info('GET calendar details')

      const { calendarService, calendarOvertimeService } = req.app.get('DataServices')

      try {
        const userAuthenticationDetails = await userAuthenticationService.getUserAuthenticationDetails(
          req.user.username,
        )

        const apiShiftDetailsResponse = await calendarService.getCalendarDetails(
          userAuthenticationDetails[0].ApiUrl,
          req.params.date,
          req.user.token,
        )

        const apiOvertimeShiftDetailsResponse = await calendarOvertimeService.getCalendarOvertimeDetails(
          userAuthenticationDetails[0].ApiUrl,
          req.params.date,
          req.user.token,
        )

        res.render('pages/calendar-details', {
          data: apiShiftDetailsResponse,
          overtimeShiftDetailsData: apiOvertimeShiftDetailsResponse,
          date: req.params.date,
          uid: req.user.username,
          employeeName: req.user.employeeName,
          csrfToken: res.locals.csrfToken,
          hmppsAuthMFAUser: req.hmppsAuthMFAUser,
          authUrl: req.authUrl,
        })
      } catch (error) {
        serviceUnavailable(logger, req, res)
      }
    }),
  )

  return router
}
