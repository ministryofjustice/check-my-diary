const router = require('express').Router()
const moment = require('moment')

const { check } = require('express-validator')

const { getSnoozeUntil } = require('../helpers/utilities')

const logger = require('../../log')
const postNotificationMiddleware = require('../middleware/postNotificationMiddleware')
const notificationSettingsMiddleware = require('../middleware/notificationSettingsMiddleware')
const {
  postNotificationSettingsMiddleware,
  postNotificationSettingsValidationRules,
} = require('../middleware/postNotificationSettingsMiddleware')
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

router
  .route('/settings')
  .get(notificationSettingsMiddleware)
  .post(postNotificationSettingsValidationRules(), postNotificationSettingsMiddleware)

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
  .get(async (req, res, next) => {
    try {
      const {
        app,
        hmppsAuthMFAUser,
        authUrl,
      } = req

      const {
        locals: { csrfToken },
      } = res
      let errors
      const { notificationService } = app.get('DataServices')
      const [{ snoozeUntil }, data] = await Promise.all([
        notificationService.getPreferences(token),
        notificationService.getNotifications(token),
      ]).catch((error) => {
        errors = error
      })

      logger.info('GET notifications view')

      return res.render('pages/notifications', {
        errors,
        data,
        csrfToken,
        hmppsAuthMFAUser,
        snoozeUntil: getSnoozeUntil(snoozeUntil),
        moment,
        employeeName,
        authUrl,
      })
    } catch (error) {
      res.locals.error = error
      return next()
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
