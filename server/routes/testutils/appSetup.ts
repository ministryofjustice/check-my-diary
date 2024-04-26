import express, { Express } from 'express'
import cookieSession from 'cookie-session'
import createError from 'http-errors'
import path from 'path'
import jsonwebtoken from 'jsonwebtoken'

import routes from '../index'
import errorHandler from '../../errorHandler'
import type { Services } from '../../services'
import * as auth from '../../authentication/auth'
import nunjucksSetup from '../../utils/nunjucksSetup'
import setUpCurrentUser from '../../middleware/setUpCurrentUser'

function appSetup(services: Services, production: boolean): Express {
  const app = express()

  nunjucksSetup(app, path)

  const authUser = { name: 'first last', authorities: 'ROLE_BOB' }
  const token = jsonwebtoken.sign(authUser, 'ssshhh', { expiresIn: '1h' })

  app.use((req, res, next) => {
    req.user = {
      employeeName: authUser.name,
      authSource: 'nomis',
      token,
      username: 'user1',
    }
    res.locals.user = req.user
    next()
  })

  app.use(cookieSession({ keys: [''] }))
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(setUpCurrentUser())
  app.use(routes(services))
  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(production))

  return app
}

export default function appWithAllRoutes({
  production = false,
  services = {},
}: {
  production?: boolean
  services?: Partial<Services>
}): Express {
  auth.default.authenticationMiddleware = () => (req, res, next) => next()
  return appSetup(services as Services, production)
}
