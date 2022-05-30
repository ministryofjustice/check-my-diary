const router = require('express').Router()
const { check } = require('express-validator')
const moment = require('moment')

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
const { getSnoozeUntil } = require('../helpers/utilities')

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

// ///////////////////////////// new routers:

const getManageMiddleware = async (req, res, next) => {
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
    const { snoozeUntil: rawSnoozeUntil, preference = NONE } = await notificationService.getPreferences(token)
    const notificationsEnabled = preference !== NONE

    return res.render('pages/manage-your-notifications', {
      errors,
      csrfToken,
      notificationsEnabled,
      snoozeUntil: notificationsEnabled ? getSnoozeUntil(rawSnoozeUntil) : '',
      employeeName,
      authUrl,
    })
  } catch (error) {
    return next(error)
  }
}
router.get('/manage', getManageMiddleware)

const getPauseMiddleware = async (req, res, next) => {
  try {
    const {
      user: { employeeName, token },
      query: { pauseUnit, pauseValue },
      app,
      authUrl,
    } = req

    const {
      locals: { csrfToken, errors = null },
    } = res
    const { notificationService } = app.get('DataServices')
    const { snoozeUntil: rawSnoozeUntil, preference = NONE } = await notificationService.getPreferences(token)
    const notificationsEnabled = preference !== NONE

    return res.render('pages/pause-notifications', {
      errors,
      csrfToken,
      notificationsEnabled,
      snoozeUntil: notificationsEnabled ? getSnoozeUntil(rawSnoozeUntil) : '',
      employeeName,
      authUrl,
      pauseUnit,
      pauseValue,
    })
  } catch (error) {
    return next(error)
  }
}

const postPauseMiddleware = async (req, res, next) => {
  try {
    const {
      user: { token },
      app,
      body: { pauseUnit, pauseValue },
    } = req
    const {
      locals: { errors = null },
    } = res
    if (!errors || errors.length === 0) {
      const {
        notificationService: { updateSnooze },
      } = app.get('DataServices')
      await updateSnooze(token, moment().add(pauseValue, pauseUnit).format('YYYY-MM-DD'))
      res.redirect('/notifications/manage')
    }

    req.query = { pauseUnit, pauseValue }
    return next()
  } catch (error) {
    const message = 'Pause notifications failed. Please try again.'
    logger.error(error, message)
    res.locals.error = [message]
    return next()
  }
}

router
  .route('/pause')
  .get(getPauseMiddleware)
  .post(
    [
      check('pauseValue', 'Enter a number').exists({ checkFalsy: true }).isInt({ min: 1, max: 99 }),
      check('pauseUnit', 'Select a period of time').exists({ checkFalsy: true }).isIn(['days', 'weeks', 'months']),
    ],
    validate,
    postPauseMiddleware,
    getPauseMiddleware,
  )

module.exports = router
