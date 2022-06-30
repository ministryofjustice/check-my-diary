import { Request, Response } from 'express'
import type { NotificationService } from '../services'

export default class NotificationSettingsController {
  constructor(private readonly notificationService: NotificationService) {}

  async getSettings(req: Request, res: Response) {
    const {
      user: { employeeName, token },
      authUrl,
    } = req
    const { preference: contactMethod = '', email: inputEmail = '' } = await this.notificationService.getPreferences(
      token,
    )

    return res.render('pages/notification-settings', {
      errors: null,
      contactMethod,
      inputEmail,
      employeeName,
      csrfToken: res.locals.csrfToken,
      authUrl,
    })
  }
}
