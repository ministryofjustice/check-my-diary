import { RequestHandler } from 'express'
import { jwtDecode } from 'jwt-decode'

import logger from '../../log'
import config from '../config'
import utilities from '../helpers/utilities'

export default function populateCurrentUser(): RequestHandler {
  return async (req, res, next) => {
    try {
      if (res.locals.user && req.user) {
        const {
          user: { token },
        } = req
        req.authUrl = config.apis.hmppsAuth.url
        req.hmppsAuthMFAUser = utilities.hmppsAuthMFAUser(token)
        const employeeName = (jwtDecode(token) as { name: string }).name
        req.user.employeeName = employeeName
        // also copy into res.locals.user to grab out in nunjucks templates
        res.locals.user = { displayName: employeeName, ...res.locals.user }
      }
      next()
    } catch (error) {
      logger.error(error, `Failed to retrieve user for: ${res.locals.user}`)
      next(error)
    }
  }
}
