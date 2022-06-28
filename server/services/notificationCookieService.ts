import { Request, Response } from 'express'

const COOKIE_NAME = 'ui-notification-banner'
const key = (id: string) => `${COOKIE_NAME}-${id}`

export const markAsDismissed = (res: Response, id: string) => {
  const oneYear = 52 * 24 * 3600000
  return res.cookie(key(id), 'dismissed', { maxAge: oneYear, httpOnly: true })
}

export const alreadyDismissed = (req: Request, id: string) => req.cookies && req.cookies[key(id)] === 'dismissed'

export default {
  markAsDismissed,
  alreadyDismissed,
}
