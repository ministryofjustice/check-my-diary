const router = require('express').Router()
const moment = require('moment')

const { check, validationResult } = require('express-validator')

const { getSnoozeUntil } = require('../helpers/utilities')

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
    try {
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
        res.redirect('/notifications')
      }
    } catch (error) {
      serviceUnavailable(req, res)
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
  .route('/')
  .get(async (req, res) => {
    const {
      user: { token, employeeName, authUrl },
      app,
      hmppsAuthMFAUser,
    } = req

    const {
      locals: { csrfToken },
    } = res

    const { notificationService } = app.get('DataServices')
    try {
      const [{ snoozeUntil }, data] = await Promise.all([
        notificationService.getPreferences(token),
        notificationService.getNotifications(token),
      ])

      logger.info('GET notifications view')

      return res.render('pages/notifications', {
        errors: null,
        data,
        csrfToken,
        employeeName,
        hmppsAuthMFAUser,
        authUrl,
        snoozeUntil: getSnoozeUntil(snoozeUntil),
        moment,
      })
    } catch (errors) {
      return res.render('pages/notifications', {
        errors,
        csrfToken,
        employeeName,
        hmppsAuthMFAUser,
        authUrl,
      })
    }
  })
  .post(
    [
      check('pauseValue', 'Must be a number under 100').exists({ checkFalsy: true }).isInt({ min: 1, max: 99 }),
      check('pauseUnit', 'Must be selected').exists({ checkFalsy: true }).isIn(['days', 'weeks', 'months']),
    ],
    validate,
    postNotificationMiddleware,
    (req, res) => {
      res.redirect('/notifications')
    },
  )

module.exports = router
