import { NextFunction, Request, Response } from 'express'

import { NOTIFICATION_SETTINGS_ERROR } from '../helpers/errorConstants'
import { appendUserErrorMessage } from '../helpers/utilities'

export default class NotificationSettingsController {
  async getSettings(req: Request, res: Response, next: NextFunction) {
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
}
