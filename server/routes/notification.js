const router = require('express').Router()
const { check } = require('express-validator')

const logger = require('../../log')
const postNotificationMiddleware = require('../middleware/postNotificationMiddleware')
const notificationSettingsMiddleware = require('../middleware/notificationSettingsMiddleware')
const {
  postNotificationSettingsMiddleware,
  postNotificationSettingsValidationRules,
} = require('../middleware/postNotificationSettingsMiddleware')
const validate = require('../middleware/validate')
const notificationMiddleware = require('../middleware/notificationMiddleware')
const { NONE } = require('../helpers/constants')

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
  .get(notificationMiddleware)
  .post(
    [
      check('pauseValue', 'Must be a number under 100').exists({ checkFalsy: true }).isInt({ min: 1, max: 99 }),
      check('pauseUnit', 'Must be selected').exists({ checkFalsy: true }).isIn(['days', 'weeks', 'months']),
    ],
    validate,
    postNotificationMiddleware,
    notificationMiddleware,
  )

router.get('/manage', async (req, res, next) => {
  try {
    const {
      user: { employeeName, token },
      app,
      authUrl,
    } = req

    const {
      locals: { csrfToken, errors = null },
    } = res
    const { notificationService } = app.get('DataServices')
    const { preference = NONE } = await notificationService.getPreferences(token)
    const notificationsEnabled = preference !== NONE
    logger.info('GET notifications view')

    return res.render('pages/manage-your-notifications', {
      errors,
      csrfToken,
      notificationsEnabled,
      employeeName,
      authUrl,
    })
  } catch (error) {
    return next(error)
  }
})

module.exports = router
