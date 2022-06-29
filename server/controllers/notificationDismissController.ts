import { Request, Response } from 'express'

export default () => async (req: Request, res: Response) => {
  const { app, xhr, body: { id } = {} } = req
  const { notificationCookieService } = app.get('DataServices')

  if (!xhr) return res.redirect('/')
  if (!id) {
    res.status(400)
    return res.end()
  }

  notificationCookieService.markAsDismissed(res, id)

  res.status(200)

  return res.end()
}
