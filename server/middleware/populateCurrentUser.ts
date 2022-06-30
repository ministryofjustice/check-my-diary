import { RequestHandler } from 'express'
import jwtDecode from 'jwt-decode'

import logger from '../../log'
import config from '../../config'
import { hmppsAuthMFAUser } from '../helpers/utilities'

export default function populateCurrentUser(): RequestHandler {
  return async (req, res, next) => {
    try {
      if (res.locals.user) {
        const {
          user: { token },
        } = req
        req.authUrl = config.apis.hmppsAuth.url
        req.hmppsAuthMFAUser = hmppsAuthMFAUser(token)
        req.user.employeeName = (jwtDecode(token) as { name: string }).name
      }
      next()
    } catch (error) {
      logger.error(error, `Failed to retrieve user for: ${res.locals.user}`)
      next(error)
    }
  }
}
