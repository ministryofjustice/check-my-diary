import { Request, Response } from 'express'
import { validationResult } from 'express-validator'

import NotificationType from '../helpers/NotificationType'
import logger from '../../log'
import type { NotificationService } from '../services'

export default class PostNotificationSettingsController {
  constructor(private readonly notificationService: NotificationService) {}

  async setSettings(req: Request, res: Response) {
    logger.info('POST notifications settings')

    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req)
    const {
      user: { token },
      body: { contactMethod, inputEmail = '', inputSMS = '' },
    } = req

    if (!errors.isEmpty()) {
      return res.render('pages/notification-settings.njk', {
        errors,
        contactMethod,
        inputEmail,
        inputSMS,
      })
    }

    await this.notificationService.updatePreferences(
      token,
      contactMethod,
      contactMethod === NotificationType.EMAIL ? inputEmail : '',
      contactMethod === NotificationType.SMS ? inputSMS : '',
    )
    return res.redirect('/notifications/manage')
  }
}
