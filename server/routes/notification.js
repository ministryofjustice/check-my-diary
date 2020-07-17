const router = require('express').Router()
const { check, validationResult } = require('express-validator')

const getNotificationMiddleware = require('../middleware/getNotificationMiddleware')
const logger = require('../../log')
const postNotificationMiddleware = require('../middleware/postNotificationMiddleware')
const validate = require('../middleware/validate')

/**
 * Service unavailable
 * @param req
 * @param res
 */
function serviceUnavailable(req, res) {
  logger.error('Service unavailable')
  res.render('pages/index', {
    authError: false,
    csrfToken: res.locals.csrfToken,
  })
}

router.get('/settings', async (req, res) => {
  logger.info('GET notifications settings')
  const {
    user: { username, employeeName },
    hmppsAuthMFAUser,
    app,
  } = req
  const { DEPRECATEnotificationService } = app.get('DataServices')
  const userNotificationSettings = await DEPRECATEnotificationService.getUserNotificationSettings(username)
  res.render('pages/notification-settings', {
    errors: null,
    userNotificationSettings: userNotificationSettings[0] || null,
    uid: username,
    employeeName,
    csrfToken: res.locals.csrfToken,
    hmppsAuthMFAUser,
    authUrl: req.authUrl,
  })
})

router.post(
  '/settings',
  [
    // email address
    check('inputEmail', 'Must be a valid email address').optional({ checkFalsy: true }).isEmail(),
    // mobile number
    check('inputMobile', 'Must be a valid mobile number').optional({ checkFalsy: true }).isMobilePhone('en-GB'),
  ],
  async (req, res) => {
    logger.info('POST notifications settings')

    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req)

    const { DEPRECATEnotificationService } = req.app.get('DataServices')

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
        hmppsAuthMFAUser: req.hmppsAuthMFAUser,
        authUrl: req.authUrl,
      })
    } else {
      await DEPRECATEnotificationService.updateUserNotificationSettings(
        req.user.username,
        req.body.inputEmail === '' ? null : req.body.inputEmail,
        req.body.inputMobile === '' ? null : req.body.inputMobile,
        !!(req.body.optionEmail !== undefined && req.body.inputEmail !== ''),
        !!(req.body.optionMobile !== undefined && req.body.inputMobile !== ''),
      )
      res.redirect('/notifications/1')
    }
  },
)

router.post('/resume', async (req, res) => {
  try {
    const {
      user: { token },
      app,
    } = req
    const {
      notificationService: { resumeNotifications },
    } = app.get('DataServices')
    await resumeNotifications(token)
    res.redirect('back')
  } catch (error) {
    serviceUnavailable(req, res)
  }
})

router
  .route('/:page')
  .get(getNotificationMiddleware)
  .post(
    [
      check('pauseValue', 'Must be a number under 100').exists({ checkFalsy: true }).isInt({ min: 1, max: 99 }),
      check('pauseUnit', 'Must be selected').exists({ checkFalsy: true }).isIn(['days', 'weeks', 'months']),
    ],
    validate,
    postNotificationMiddleware,
    getNotificationMiddleware,
  )

module.exports = router
