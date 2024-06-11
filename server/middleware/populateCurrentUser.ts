import { RequestHandler } from 'express'
import { jwtDecode } from 'jwt-decode'
import logger from '../../logger'
import { convertToTitleCase } from '../utils/utils'
import config from '../config'

export default function populateCurrentUser(): RequestHandler {
  return async (req, res, next) => {
    try {
      const { name, authorities: roles = [] } = jwtDecode(res.locals.user.token) as {
        name: string
        authorities: string[]
      }

      res.locals.user = {
        ...res.locals.user,
        name,
        displayName: convertToTitleCase(name),
        userRoles: roles.map(role => role.substring(role.indexOf('_') + 1)),
      }
      req.authUrl = config.apis.hmppsAuth.url
      next()
    } catch (error) {
      logger.error(error, `Failed to retrieve user for: ${res.locals.user && res.locals.user.username}`)
      next(error)
    }
  }
}
