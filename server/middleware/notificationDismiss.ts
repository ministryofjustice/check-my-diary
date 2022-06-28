import { Request, Response } from 'express'
import { markAsDismissed } from '../services/notificationCookieService'

export default () => async (req: Request, res: Response) => {
  const id = req.body?.id

  if (!req.xhr) return res.redirect('/')
  if (!id) {
    res.status(400)
    return res.end()
  }

  markAsDismissed(res, id)

  res.status(200)

  return res.end()
}
