import express, { Router, Express } from 'express'
import cookieSession from 'cookie-session'
import createError from 'http-errors'
import path from 'path'

import indexRouter from '../index'
import createErrorHandler from '../../errorHandler'
import standardRouter from '../standardRouter'
import { services } from '../../services'
import * as auth from '../../authentication/auth'
import nunjucksSetup from '../../utils/nunjucksSetup'
import ejsSetup from '../../utils/ejsSetup'

function appSetup(route: Router, production: boolean, hmppsAuthMFAUser: boolean): Express {
  const app = express()

  nunjucksSetup(app, path)
  ejsSetup(app, path)

  app.use((req, res, next) => {
    req.user = {
      employeeName: 'first last',
      authSource: 'nomis',
      token: 'token',
      username: 'user1',
    }
    req.hmppsAuthMFAUser = hmppsAuthMFAUser
    next()
  })

  app.use(cookieSession({ keys: [''] }))
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use('/', route)
  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(createErrorHandler(production))

  return app
}

export default function appWithAllRoutes({
  production = false,
  hmppsAuthMFAUser = false,
}: {
  production?: boolean
  hmppsAuthMFAUser?: boolean
}): Express {
  auth.default.authenticationMiddleware = () => (req, res, next) => next()
  const svcs = services()
  return appSetup(indexRouter(standardRouter(svcs.userAuthenticationService), svcs), production, hmppsAuthMFAUser)
}
