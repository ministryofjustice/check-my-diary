const utilities = require('../helpers/utilities')
const asyncMiddleware = require('../middleware/asyncMiddleware')
 
module.exports = (logger, calendarService, notificationService) => router =>{
  
  function serviceUnavailable(req, res) {
    logger.error('Service unavailable')
    res.render('pages/index', {
      authError: false,
      apiUp: false,
      csrfToken: req.csrfToken()
    })
  }

  router.get('/:date', asyncMiddleware(async (req, res) => {
    logger.info('GET calendar view')
      try {
      
          const shiftNotifications = await notificationService.getShiftNotifications(req.user.username)

          const apiResponse = await calendarService.getCalendarData(req.user.apiUrl, req.user.username, req.params.date, req.user.token)
          res.render('pages/calendar', {shiftNotifications : shiftNotifications, tab: 'Calendar', startDate: req.params.date, data: apiResponse, 
                                        uid: req.user.username, employeeName: req.user.employeeName, csrfToken: req.csrfToken()})    

      } catch (error) {      
        serviceUnavailable(req, res)
      }   
    })
  )

  router.get('*', function(req, res) {
    logger.info('Catch and redirect to current month view')
    res.redirect(`/calendar/${utilities.getStartMonth()}`)
  })

  return router
}
