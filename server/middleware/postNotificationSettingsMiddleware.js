const { body, validationResult } = require('express-validator')
const logger = require('../../log')
const { NONE, EMAIL, SMS } = require('../helpers/constants')
const { appendUserErrorMessage } = require('../helpers/utilities')
const { NOTIFICATION_SETTINGS_POST_ERROR } = require('../helpers/errorConstants')

const validationRules = () => {
  const contactMethod = 'contactMethod'
  return [
    body(contactMethod, 'Must select one option').isIn([NONE, EMAIL, SMS]),
    body('inputEmail', 'Must be a valid email address').if(body(contactMethod).equals(EMAIL)).isEmail(),
    body('inputMobile', 'Must be a valid mobile number').if(body(contactMethod).equals(SMS)).isMobilePhone('en-GB'),
  ]
}

const postNotificationSettingsMiddleware = async (req, res, next) => {
  try {
    logger.info('POST notifications settings')

    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req)
    const {
      app,
      authUrl,
      hmppsAuthMFAUser,
      user: { token, employeeName },
      body: { contactMethod = NONE, inputEmail = '', inputMobile = '' },
    } = req
    const {
      locals: { csrfToken },
    } = res
    if (!errors.isEmpty()) {
      return res.render('pages/notification-settings', {
        errors: errors.mapped(),
        contactMethod,
        inputEmail,
        inputMobile,
        employeeName,
        csrfToken,
        hmppsAuthMFAUser,
        authUrl,
      })
    }
    const {
      notificationService: { updatePreferences },
    } = app.get('DataServices')
    await updatePreferences(
      token,
      contactMethod,
      contactMethod === EMAIL ? inputEmail : '',
      contactMethod === SMS ? inputMobile : '',
    )
    return res.redirect('/notifications')
  } catch (error) {
    return next(appendUserErrorMessage(error, NOTIFICATION_SETTINGS_POST_ERROR))
  }
}

module.exports = { postNotificationSettingsMiddleware, postNotificationSettingsValidationRules: validationRules }
