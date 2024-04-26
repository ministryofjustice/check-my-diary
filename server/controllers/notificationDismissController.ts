import { Request, Response } from 'express'

import NotificationCookieService from '../services/notificationCookieService'

export default class NotificationDismissController {
  constructor(private readonly notificationCookieService: NotificationCookieService) {}

  async dismiss(req: Request, res: Response) {
    const { xhr, body: { id } = {} } = req

    if (!xhr) return res.redirect('/')
    if (!id) {
      res.status(400)
      return res.end()
    }

    this.notificationCookieService.markAsDismissed(res, id)

    res.status(200)

    return res.end()
  }
}
