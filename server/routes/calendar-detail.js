const asyncMiddleware = require('../middleware/asyncMiddleware')

module.exports = (logger, calendarService) => router => {
  function serviceUnavailable(req, res) {
    logger.error('Service unavailable')
    res.render('pages/index', {
      authError: false,
      apiUp: false,
      csrfToken: req.csrfToken(),
    })
  }

  router.get(
    '/:date',
    asyncMiddleware(async (req, res) => {
      logger.info('GET calendar details')
      try {
        const apiResponse = await calendarService.getCalendarDetails(
          req.user.apiUrl,
          req.user.username,
          req.params.date,
          req.user.token
        )

        res.render('pages/calendar-details', {
          data: apiResponse,
          date: req.params.date,
          uid: req.user.username,
          employeeName: req.user.employeeName,
          csrfToken: req.csrfToken(),
        })
      } catch (error) {
        serviceUnavailable(req, res)
      }
    })
  )

  return router
}
