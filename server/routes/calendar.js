const utilities = require('../helpers/utilities')
const asyncMiddleware = require('../middleware/asyncMiddleware')

module.exports = (logger, calendarService, notificationService) => (router) => {
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
      logger.info('GET calendar view')
      try {
        const shiftNotifications = await notificationService.getShiftNotifications(req.user.username)

        // eslint-disable-next-line no-console
        // console.log(JSON.stringify(shiftNotifications))

        const apiResponse = await calendarService.getCalendarData(
          req.user.apiUrl,
          req.user.username,
          req.params.date,
          req.user.token,
        )

        // eslint-disable-next-line no-console
        // console.log(JSON.stringify(apiResponse))

        // eslint-disable-next-line no-console
        // console.log(`date : ${req.params.date}`)

        res.render('pages/calendar', {
          shiftNotifications,
          tab: 'Calendar',
          startDate: req.params.date,
          data: apiResponse,
          uid: req.user.username,
          employeeName: req.user.employeeName,
          csrfToken: res.locals.csrfToken,
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
