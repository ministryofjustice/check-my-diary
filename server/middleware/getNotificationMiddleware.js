const logger = require('../../log')
const { getSnoozeUntil } = require('../helpers/utilities')

const getNotificationMiddleware = async (req, res, next) => {
  try {
    const {
      user: { username, token },
      query: reqData,
      params: { page: rawPage },
      app,
    } = req
    const {
      locals: { errors = null },
    } = res

    const {
      DEPRECATEnotificationService: {
        getShiftNotifications,
        getShiftNotificationsPaged,
        updateShiftNotificationsToRead,
      },
      notificationService: { getPreferences },
    } = app.get('DataServices')
    const perPage = reqData.perPage || 10
    let page = parseInt(rawPage, 10) || 2
    if (page < 1) page = 1
    const offset = (page - 1) * perPage

    const [count, rows, { snoozeUntil }] = await Promise.all([
      getShiftNotifications(username),
      getShiftNotificationsPaged(username, offset, perPage),
      getPreferences(token),
      updateShiftNotificationsToRead(username),
    ])
    const pagination = {
      total: count.length,
      per_page: perPage,
      offset,
      to: offset + rows.length,
      last_page: Math.ceil(count.length / perPage),
      current_page: page,
      previous_page: page - 1,
      next_page: page + 1,
      from: offset,
      data: rows,
    }

    logger.info('GET notifications view')
    return res.render('pages/notifications', {
      errors,
      data: pagination,
      shiftNotifications: rows,
      tab: 'Notifications',
      uid: req.user.username,
      employeeName: req.user.employeeName,
      csrfToken: res.locals.csrfToken,
      hmppsAuthMFAUser: req.hmppsAuthMFAUser,
      authUrl: req.authUrl,
      snoozeUntil: getSnoozeUntil(snoozeUntil),
    })
  } catch (error) {
    res.local.error = error
    return next()
  }
}

module.exports = getNotificationMiddleware
