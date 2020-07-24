const logger = require('../../log')
const { NONE } = require('../helpers/constants')

const notificationSettingsMiddleware = async (req, res, next) => {
  logger.info('GET notifications settings')
  try {
    const {
      user: { employeeName, token },
      hmppsAuthMFAUser,
      authUrl,
      app,
    } = req
    const {
      notificationService: { getPreferences },
    } = app.get('DataServices')
    const { preference: contactMethod = NONE, email: inputEmail = '', sms: inputMobile = '' } = await getPreferences(
      token,
    )

    return res.render('pages/notification-settings', {
      errors: null,
      contactMethod,
      inputEmail,
      inputMobile,
      employeeName,
      csrfToken: res.locals.csrfToken,
      hmppsAuthMFAUser,
      authUrl,
    })
  } catch (error) {
    res.locals.error = error
    return next()
  }
}

module.exports = notificationSettingsMiddleware
