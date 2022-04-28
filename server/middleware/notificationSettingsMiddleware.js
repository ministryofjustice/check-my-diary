const logger = require('../../log')
const { NONE } = require('../helpers/constants')
const { appendUserErrorMessage } = require('../helpers/utilities')
const { NOTIFICATION_SETTINGS_ERROR } = require('../helpers/errorConstants')

const notificationSettingsMiddleware = async (req, res, next) => {
  logger.info('GET notifications settings')
  try {
    const {
      user: { employeeName, token },
      authUrl,
      app,
    } = req
    const {
      notificationService: { getPreferences },
    } = app.get('DataServices')
    const {
      preference: contactMethod = NONE,
      email: inputEmail = '',
      sms: inputMobile = '',
    } = await getPreferences(token)

    return res.render('pages/notification-settings', {
      errors: null,
      contactMethod,
      inputEmail,
      inputMobile,
      employeeName,
      csrfToken: res.locals.csrfToken,
      authUrl,
    })
  } catch (error) {
    return next(appendUserErrorMessage(error, NOTIFICATION_SETTINGS_ERROR))
  }
}

module.exports = notificationSettingsMiddleware
