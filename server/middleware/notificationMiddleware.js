const moment = require('moment')

const logger = require('../../log')
const { NONE } = require('../helpers/constants')
const { getSnoozeUntil } = require('../helpers/utilities')

const notificationMiddleware = async (req, res, next) => {
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
    const [{ snoozeUntil: rawSnoozeUntil, preference = NONE }, data] = await Promise.all([
      notificationService.getPreferences(token),
      notificationService.getNotifications(token),
    ])
    data.sort(({ shiftModified: first }, { shiftModified: second }) => moment(second) - moment(first))
    const notificationsEnabled = preference !== NONE
    logger.info('GET notifications view')

    return res.render('pages/notifications', {
      errors,
      data,
      csrfToken,
      notificationsEnabled,
      snoozeUntil: notificationsEnabled ? getSnoozeUntil(rawSnoozeUntil) : '',
      moment,
      employeeName,
      authUrl,
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = notificationMiddleware
