import type { Request, Response, NextFunction } from 'express'
import { isFuture } from 'date-fns'
import logger from '../../log'
import type { UserAuthenticationService } from '../services'

export default class CmdSessionExpiry {
  constructor(private readonly userAuthenticationService: UserAuthenticationService) {}

  public async cmd2faSessionExpiry(
    { hmppsAuthMFAUser, user: { username } }: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (hmppsAuthMFAUser) return next()
      const userSessionExpiryDateTime = await this.userAuthenticationService.getSessionExpiryDateTime(username)
      if (userSessionExpiryDateTime.length === 0) return next()
      const [{ SessionExpiryDateTime }] = userSessionExpiryDateTime
      if (SessionExpiryDateTime && isFuture(new Date(SessionExpiryDateTime))) return next()
      return res.redirect('/auth/login')
    } catch (error) {
      logger.error(error)
      return res.redirect('/auth/login')
    }
  }
}
