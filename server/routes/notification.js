const { check, validationResult } = require('express-validator')
const asyncMiddleware = require('../middleware/asyncMiddleware')

module.exports = (logger, notificationService) => (router) => {
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
      csrfToken: res.locals.csrfToken,
    })
  }

  router.get(
    '/settings',
    asyncMiddleware(async (req, res) => {
      logger.info('GET notifications settings')

      const userNotificationSettings = await notificationService.getUserNotificationSettings(req.user.username)

      if (userNotificationSettings === null || userNotificationSettings.length === 0) {
        res.render('pages/notification-settings', {
          errors: null,
          userNotificationSettings: null,
          uid: req.user.username,
          employeeName: req.user.employeeName,
          csrfToken: res.locals.csrfToken,
        })
      } else {
        res.render('pages/notification-settings', {
          errors: null,
          userNotificationSettings: userNotificationSettings[0],
          uid: req.user.username,
          employeeName: req.user.employeeName,
          csrfToken: res.locals.csrfToken,
        })
      }
    }),
  )

  router.post(
    '/settings',
    [
      // email address
      check('inputEmail', 'Must be a valid email address').optional({ checkFalsy: true }).isEmail(),
      // mobile number
      check('inputMobile', 'Must be a valid mobile number').optional({ checkFalsy: true }).isMobilePhone('en-GB'),
    ],
    asyncMiddleware(async (req, res) => {
      logger.info('POST notifications settings')

      // Finds the validation errors in this request and wraps them in an object with handy functions
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        const data = {
          email: req.body.inputEmail,
          optionEmail: req.body.optionEmail,
          mobile: req.body.inputMobile,
          optionMobile: req.body.optionMobile,
        }

        res.render('pages/notification-settings', {
          errors: errors.array(),
          notificationSettings: data,
          userNotificationSettings: null,
          uid: req.user.username,
          employeeName: req.user.employeeName,
          csrfToken: res.locals.csrfToken,
        })
      } else {
        await notificationService.updateUserNotificationSettings(
          req.user.username,
          req.body.inputEmail === '' ? null : req.body.inputEmail,
          req.body.inputMobile === '' ? null : req.body.inputMobile,
          !!(req.body.optionEmail !== undefined && req.body.inputEmail !== ''),
          !!(req.body.optionMobile !== undefined && req.body.inputMobile !== ''),
        )
        res.redirect('/notifications/1')
      }
    }),
  )

  router.get(
    '/:page',
    asyncMiddleware(async (req, res) => {
      try {
        const reqData = req.query
        const pagination = {}
        const perPage = reqData.perPage || 10
        // eslint-disable-next-line radix
        let page = parseInt(req.params.page) || 2
        if (page < 1) page = 1
        const offset = (page - 1) * perPage

        Promise.all([
          notificationService.getShiftNotificationsCount(req.user.username),
          notificationService.getShiftTaskNotificationsCount(req.user.username),
          notificationService.getShiftNotificationsPaged(req.user.username, offset, perPage),
        ]).then(([totalShiftNotifications, totalShiftTaskNotifications, rows]) => {
          // eslint-disable-next-line radix
          const count = parseInt(totalShiftNotifications.count) + parseInt(totalShiftTaskNotifications.count)
          pagination.total = count
          pagination.per_page = perPage
          pagination.offset = offset
          pagination.to = offset + rows.length
          pagination.last_page = Math.ceil(count / perPage)
          pagination.current_page = page
          pagination.previous_page = page - 1
          pagination.next_page = page + 1
          pagination.from = offset
          pagination.data = rows

          res.render('pages/notifications', {
            data: pagination,
            shiftNotifications: rows,
            tab: 'Notifications',
            uid: req.user.username,
            employeeName: req.user.employeeName,
            csrfToken: res.locals.csrfToken,
          })
        })

        logger.info('GET notifications view')

        await notificationService.updateShiftNotificationsToRead(req.user.username)
        await notificationService.updateShiftTaskNotificationsToRead(req.user.username)
      } catch (error) {
        serviceUnavailable(req, res)
      }
    }),
  )

  return router
}
