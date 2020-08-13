const moment = require('moment')

const logger = require('../../log')
const { NONE } = require('../helpers/constants')
const { getSnoozeUntil } = require('../helpers/utilities')

const notificationMiddleware = async (req, res, next) => {
  try {
    const {
      user: { employeeName, token },
      app,
      hmppsAuthMFAUser,
      authUrl,
    } = req

    const {
      locals: { csrfToken, errors = null },
    } = res
    const { notificationService } = app.get('DataServices')
    const [{ snoozeUntil, preference = NONE }, data] = await Promise.all([
      notificationService.getPreferences(token),
      notificationService.getNotifications(token),
    ])

    const notificationsEnabled = preference !== NONE
    logger.info('GET notifications view')

    return res.render('pages/notifications', {
      errors,
      data,
      csrfToken,
      hmppsAuthMFAUser,
      notificationsEnabled,
      snoozeUntil: notificationsEnabled ? getSnoozeUntil(snoozeUntil) : '',
      moment,
      employeeName,
      authUrl,
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = notificationMiddleware
