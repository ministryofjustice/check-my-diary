import type { Request, Response } from 'express'
import { validationResult } from 'express-validator'

import NotificationService from '../services/notificationService'

export default class NotificationSettingsController {
  constructor(private readonly notificationService: NotificationService) {}

  async getSettings(req: Request, res: Response): Promise<void> {
    const { user } = req

    if (!user) return
    const {
      preference: contactMethod = '',
      email: inputEmail = '',
      sms: inputSMS = '',
    } = await this.notificationService.getPreferences(user.token)

    res.render('pages/notification-settings.njk', {
      errors: validationResult(req),
      contactMethod,
      inputEmail,
      inputSMS,
    })
  }
}
