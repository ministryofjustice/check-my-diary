import { Request, Response } from 'express'
import { validationResult } from 'express-validator'

import NotificationType from '../helpers/NotificationType'
import logger from '../../logger'
import type { NotificationService } from '../services'

export default class PostNotificationSettingsController {
  constructor(private readonly notificationService: NotificationService) {}

  async setSettings(req: Request, res: Response) {
    logger.info('POST notifications settings')

    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req)
    const {
      user,
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

    if (!user) return false
    await this.notificationService.updatePreferences(
      user.token,
      contactMethod,
      contactMethod === NotificationType.EMAIL ? inputEmail : '',
      contactMethod === NotificationType.SMS ? inputSMS.replace('+44', '0') : '',
    )
    return res.redirect('/notifications/manage')
  }
}
