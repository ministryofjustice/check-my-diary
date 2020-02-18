const { check, validationResult } = require('express-validator')
const asyncMiddleware = require('../middleware/asyncMiddleware')
 
module.exports = (logger, notificationService) => router => {

  /**
   * Service unavailable
   * @param req
   * @param res
   */
  function serviceUnavailable(req, res) {
    logger.error('Service unavailable')
    res.render('pages/index', {
      authError: false,
      apiUp: false,
      csrfToken: req.csrfToken()
    })
  }

  router.get('/settings', asyncMiddleware(async (req, res) => {

    logger.info('GET notifications settings')

      const userNotificationSettings = await notificationService.getUserNotificationSettings(req.user.username)
      
      if (userNotificationSettings === null || userNotificationSettings.length === 0) {
        res.render('pages/notification-settings', {errors : null, userNotificationSettings: null, uid: req.user.username, employeeName: req.user.employeeName, csrfToken: req.csrfToken()})
      } else {
        res.render('pages/notification-settings', {errors : null, userNotificationSettings: userNotificationSettings[0], uid: req.user.username, employeeName: req.user.employeeName, csrfToken: req.csrfToken()})
      }
    })
  )

  router.post('/settings',  [

    // email address
    check('inputEmail', 'Must be a valid email address').optional({checkFalsy: true}).isEmail(),
    // mobile number    
    check('inputMobile', 'Must be a valid mobile number').optional({checkFalsy: true}).isMobilePhone('en-GB')

    ], async (req, res) => {

      logger.info('POST notifications settings')

      // Finds the validation errors in this request and wraps them in an object with handy functions
      const errors = validationResult(req)
      console.log(errors.mapped())
      if (!errors.isEmpty()) {
        
        const data = { 
          email: req.body.inputEmail, 
          optionEmail: req.body.optionEmail, 
          mobile: req.body.inputMobile, 
          optionMobile: req.body.optionMobile }

          res.render('pages/notification-settings', {errors : errors.array(), notificationSettings: data, userNotificationSettings: null, uid: req.user.username, employeeName: req.user.employeeName, csrfToken: req.csrfToken()})
     
      } else {
        
        await notificationService.updateUserNotificationSettings(req.user.username, req.body.inputEmail === '' ? null : req.body.inputEmail, req.body.inputMobile === '' ? null : req.body.inputMobile, req.body.optionEmail !== undefined && req.body.inputEmail != '' ? true : false, req.body.optionMobile !== undefined && req.body.inputMobile != '' ? true : false)
        res.redirect('/notifications/1')
      }
  })

  router.get('/:page', asyncMiddleware(async (req, res) => {

      try {
        
        var reqData = req.query
        var pagination = {}
        var perPage = reqData.perPage || 10
        var page = parseInt(req.params.page) || 2
        if (page < 1) page = 1
        var offset = (page - 1) * perPage

        Promise.all([
          notificationService.getShiftNotificationsCount(req.user.username),
          notificationService.getShiftTaskNotificationsCount(req.user.username),
          notificationService.getShiftNotificationsPaged(req.user.username, offset, perPage)
        ]).then(([totalShiftNotifications, totalShiftTaskNotifications, rows]) => {

              var count = parseInt(totalShiftNotifications.count) + parseInt(totalShiftTaskNotifications.count)
              var rows = rows
              pagination.total = count
              pagination.per_page = perPage
              pagination.offset = offset
              pagination.to = offset + rows.length
              pagination.last_page = Math.ceil(count / perPage)
              pagination.current_page = page
              pagination.previous_page = page-1
              pagination.next_page = page+1
              pagination.from = offset
              pagination.data = rows

              res.render('pages/notifications', {data: pagination, shiftNotifications : rows, tab: 'Notifications', 
                          uid: req.user.username, employeeName: req.user.employeeName, csrfToken: req.csrfToken()})
            })

        logger.info('GET notifications view')
        
        await notificationService.updateShiftNotificationsToRead(req.user.username)
        await notificationService.updateShiftTaskNotificationsToRead(req.user.username)
        
      } catch (error) {
        serviceUnavailable(req, res)
      }

    })
  )

  return router
}
