import { Request, Response } from 'express'
import { validationResult } from 'express-validator'

import { EMAIL, NONE } from '../helpers/constants'
import logger from '../../log'
import type { NotificationService } from '../services'

export default class PostNotificationSettingsController {
  constructor(private readonly notificationService: NotificationService) {}

  async setSettings(req: Request, res: Response) {
    logger.info('POST notifications settings')

    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req)
    const {
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

    await this.notificationService.updatePreferences(
      token,
      notificationRequired === 'Yes' ? EMAIL : NONE,
      notificationRequired === 'Yes' ? inputEmail : '',
    )
    return res.redirect('/notifications/manage')
  }
}
