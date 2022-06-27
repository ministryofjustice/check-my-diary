import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'

import { NOTIFICATION_SETTINGS_POST_ERROR } from '../helpers/errorConstants'
import { appendUserErrorMessage } from '../helpers/utilities'
import { EMAIL, NONE } from '../helpers/constants'
import logger from '../../log'

export default class PostNotificationSettingsController {
  async setSettings(req: Request, res: Response, next: NextFunction) {
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
      return res.redirect('/notifications/manage')
    } catch (error) {
      return next(appendUserErrorMessage(error, NOTIFICATION_SETTINGS_POST_ERROR))
    }
  }
}
