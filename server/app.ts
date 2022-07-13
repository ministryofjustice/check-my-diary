import express from 'express'
import path from 'path'
import createError from 'http-errors'

import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpStaticResources from './middleware/setUpStaticResources'
import createErrorHandler from './errorHandler'
import ejsSetup from './utils/ejsSetup'
import nunjucksSetup from './utils/nunjucksSetup'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpWebSession from './middleware/setUpWebSession'
import { metricsMiddleware } from './monitoring/metricsApp'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
import setUpAuth from './middleware/setUpAuthentication'
import standardRouter from './routes/standardRouter'
import indexRouter from './routes'
import { Services } from './services'

export default function createApp(services: Services) {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  app.use(metricsMiddleware)
  app.use(setUpHealthChecks())
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())

  nunjucksSetup(app, path)
  ejsSetup(app, path)
  app.use(setUpAuth(services.userAuthenticationService))

  app.use('/', indexRouter(standardRouter(services.userAuthenticationService), services))

  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(createErrorHandler(process.env.NODE_ENV === 'production'))

  return app
}
