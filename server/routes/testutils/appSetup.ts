import express, { Router, Express } from 'express'
import cookieSession from 'cookie-session'
import createError from 'http-errors'
import path from 'path'

import { indexRouter } from '../index'
import { createErrorHandler } from '../../errorHandler'
import { standardRouter } from '../standardRouter'
import { services } from '../../services'

function appSetup(route: Router, production: boolean, hmppsAuthMFAUser: boolean): Express {
  const app = express()

  app.set('views', path.join(__dirname, '../../views'))
  app.set('view engine', 'ejs')

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
  return appSetup(indexRouter(standardRouter(), services()), production, hmppsAuthMFAUser)
}
