const utilities = require('../helpers/utilities')
const asyncMiddleware = require('../middleware/asyncMiddleware')
const userAuthenticationService = require('../services/userAuthenticationService')

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

        const userAuthenticationDetails = await userAuthenticationService.getUserAuthenticationDetails(req.user.username)

        const shiftNotifications = await notificationService.getShiftNotifications(req.user.username)
     
        const apiResponse = await calendarService.getCalendarData(
          userAuthenticationDetails[0].ApiUrl,
          req.user.username,
          req.params.date,
          req.user.token,
        )
        
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
