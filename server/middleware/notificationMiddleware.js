const moment = require('moment')

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
    const data = await notificationService.getNotifications(token)

    data.sort(({ shiftModified: first }, { shiftModified: second }) => moment(second) - moment(first))

    return res.render('pages/notifications', {
      errors,
      data,
      csrfToken,
      moment,
      employeeName,
      authUrl,
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = notificationMiddleware
