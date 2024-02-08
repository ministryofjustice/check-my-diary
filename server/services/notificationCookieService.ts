import { Request, Response } from 'express'

export default class NotificationCookieService {
  COOKIE_NAME = 'ui-notification-banner'

  key = (id: string) => `${this.COOKIE_NAME}-${id}`

  public markAsDismissed = (res: Response, id: string) => {
    const oneYear = 365 * 24 * 3600000
    return res.cookie(this.key(id), 'dismissed', { maxAge: oneYear, httpOnly: true })
  }

  public alreadyDismissed = (req: Request, id: string) => req.cookies && req.cookies[this.key(id)] === 'dismissed'
}
