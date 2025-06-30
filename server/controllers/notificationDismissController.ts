import type { Request, Response } from 'express'

import NotificationCookieService from '../services/notificationCookieService'

export default class NotificationDismissController {
  constructor(private readonly notificationCookieService: NotificationCookieService) {}

  async dismiss(req: Request, res: Response): Promise<void> {
    const { xhr, body: { id } = {} } = req

    if (!xhr) {
      res.redirect('/')
      return
    }
    if (!id) {
      res.status(400)
    } else {
      this.notificationCookieService.markAsDismissed(res, id)
      res.status(200)
    }
    res.end()
  }
}
