import moment from 'moment'
import type { Request, Response, NextFunction } from 'express'

import logger from '../../log'

export default async function cmd2faSessionExpiry(
  { hmppsAuthMFAUser, app, user: { username } }: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (hmppsAuthMFAUser) return next()
    const {
      userAuthenticationService: { getSessionExpiryDateTime },
    } = app.get('DataServices')
    const userSessionExpiryDateTime = await getSessionExpiryDateTime(username)
    const [{ SessionExpiryDateTime }] = userSessionExpiryDateTime
    if (SessionExpiryDateTime && moment().isBefore(moment(SessionExpiryDateTime))) return next()
    return res.redirect('/auth/login')
  } catch (error) {
    logger.error(error)
    return res.redirect('/auth/login')
  }
}
