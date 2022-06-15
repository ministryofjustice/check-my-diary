const { validationResult } = require('express-validator')
const logger = require('../../log')
const { NONE, EMAIL } = require('../helpers/constants')
const { appendUserErrorMessage } = require('../helpers/utilities')
const { NOTIFICATION_SETTINGS_POST_ERROR } = require('../helpers/errorConstants')

const postNotificationSettingsMiddleware = async (req, res, next) => {
  try {
    logger.info('POST notifications settings')

    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req)
    const {
      app,
      authUrl,
      user: { token, employeeName },
      body: { notificationRequired = '', inputEmail = '' },
    } = req
    const {
      locals: { csrfToken },
    } = res
    // eslint-disable-next-line no-nested-ternary
    const contactMethod = notificationRequired === 'Yes' ? EMAIL : notificationRequired === 'No' ? NONE : ''

    if (!errors.isEmpty()) {
      return res.render('pages/notification-settings', {
        errors,
        contactMethod,
        inputEmail,
        employeeName,
        csrfToken,
        authUrl,
      })
    }
    const {
      notificationService: { updatePreferences },
    } = app.get('DataServices')

    await updatePreferences(
      token,
      notificationRequired === 'Yes' ? EMAIL : NONE,
      notificationRequired === 'Yes' ? inputEmail : '',
    )
    return res.redirect('/notifications')
  } catch (error) {
    return next(appendUserErrorMessage(error, NOTIFICATION_SETTINGS_POST_ERROR))
  }
}

module.exports = { postNotificationSettingsMiddleware }
