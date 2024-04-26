import { Request, Response } from 'express'
import { validationResult } from 'express-validator'

import NotificationService from '../services/notificationService'

export default class NotificationSettingsController {
  constructor(private readonly notificationService: NotificationService) {}

  async getSettings(req: Request, res: Response) {
    const { user } = req

    if (!user) return false
    const {
      preference: contactMethod = '',
      email: inputEmail = '',
      sms: inputSMS = '',
    } = await this.notificationService.getPreferences(user.token)

    return res.render('pages/notification-settings.njk', {
      errors: validationResult(req),
      contactMethod,
      inputEmail,
      inputSMS,
    })
  }
}
