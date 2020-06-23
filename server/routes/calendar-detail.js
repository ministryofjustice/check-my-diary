const asyncMiddleware = require('../middleware/asyncMiddleware')

module.exports = (logger, calendarService, calendarOvertimeService, userAuthenticationService) => (router) => {
  function serviceUnavailable(req, res) {
    logger.error('Service unavailable')
    res.render('pages/index', {
      authError: false,
      apiUp: false,
      csrfToken: res.locals.csrfToken,
    })
  }

  router.get(
    '/:date',
    asyncMiddleware(async (req, res) => {
      logger.info('GET calendar details')
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
        serviceUnavailable(req, res)
      }
    }),
  )

  return router
}
