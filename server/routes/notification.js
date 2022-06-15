const router = require('express').Router()
const { check, validationResult, body } = require('express-validator')
const { formatISO, add } = require('date-fns')

const logger = require('../../log')
const notificationSettingsMiddleware = require('../middleware/notificationSettingsMiddleware')
const { postNotificationSettingsMiddleware } = require('../middleware/postNotificationSettingsMiddleware')
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
  .post(
    [
      body('notificationRequired', 'Select if you want to receive notifications').isIn(['Yes', 'No']),

      body('inputEmail', 'Enter your email address').if(body('notificationRequired').equals('Yes')).notEmpty(),

      body('inputEmail', 'Enter an email address in the correct format, like name@example.com')
        .if(body('notificationRequired').equals('Yes'))
        .isEmail(),
    ],
    postNotificationSettingsMiddleware,
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

router.route('/').get(notificationMiddleware)

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
      locals: { csrfToken, errors },
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

function getFormattedFutureDate(pauseUnit, pauseValue) {
  const duration = {}
  duration[pauseUnit] = pauseValue
  return formatISO(add(new Date(), duration), { representation: 'date' })
}

const postPauseMiddleware = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    res.locals.errors = errors
    const {
      user: { token },
      app,
      body: { pauseUnit, pauseValue },
    } = req

    if (errors.errors.length === 0) {
      const {
        notificationService: { updateSnooze },
      } = app.get('DataServices')
      await updateSnooze(token, getFormattedFutureDate(pauseUnit, pauseValue))
      return res.redirect('/notifications/manage')
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
      check('pauseValue', 'Enter a number').exists({ checkFalsy: true }).isInt(),
      check('pauseValue', 'Enter a number above 0').isInt({ min: 1, max: 99 }),
      check('pauseUnit', 'Select a period of time').exists({ checkFalsy: true }).isIn(['days', 'weeks', 'months']),
    ],
    postPauseMiddleware,
    getPauseMiddleware,
  )

module.exports = router
