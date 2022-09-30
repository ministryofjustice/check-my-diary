import { Request, Response } from 'express'
import { validationResult } from 'express-validator'

import type { NotificationService } from '../services'

export default class NotificationSettingsController {
  constructor(private readonly notificationService: NotificationService) {}

  async getSettings(req: Request, res: Response) {
    const {
      user: { token },
    } = req
    const {
      preference: contactMethod = '',
      email: inputEmail = '',
      sms: inputSMS = '',
    } = await this.notificationService.getPreferences(token)

    return res.render('pages/notification-settings.njk', {
      errors: validationResult(req),
      contactMethod,
      inputEmail,
      inputSMS,
    })
  }
}
