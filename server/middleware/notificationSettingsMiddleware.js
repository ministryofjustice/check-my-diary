const { appendUserErrorMessage } = require('../helpers/utilities')
const { NOTIFICATION_SETTINGS_ERROR } = require('../helpers/errorConstants')

const notificationSettingsMiddleware = async (req, res, next) => {
  try {
    const {
      user: { employeeName, token },
      authUrl,
      app,
    } = req
    const {
      notificationService: { getPreferences },
    } = app.get('DataServices')
    const { preference: contactMethod = '', email: inputEmail = '' } = await getPreferences(token)

    return res.render('pages/notification-settings', {
      errors: null,
      contactMethod,
      inputEmail,
      employeeName,
      csrfToken: res.locals.csrfToken,
      authUrl,
    })
  } catch (error) {
    return next(appendUserErrorMessage(error, NOTIFICATION_SETTINGS_ERROR))
  }
}

module.exports = notificationSettingsMiddleware
