const express = require('express')
const path = require('path')
const createError = require('http-errors')

const { setUpHealthChecks } = require('./middleware/setUpHealthChecks')
const { setUpStaticResources } = require('./middleware/setUpStaticResources')
const config = require('../config')
const userAuthenticationService = require('./services/userAuthenticationService')

const { createErrorHandler } = require('./errorHandler')
const { ejsSetup } = require('./utils/ejsSetup')
const { setUpWebSecurity } = require('./middleware/setUpWebSecurity')
const { setUpWebSession } = require('./middleware/setUpWebSession')
const { metricsMiddleware } = require('./monitoring/metricsApp')
const { setUpWebRequestParsing } = require('./middleware/setupRequestParsing')
const { setUpAuth } = require('./middleware/setUpAuthentication')
const { standardRouter } = require('./routes/standardRouter')
const { indexRouter } = require('./routes')

if (config.rejectUnauthorized) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = config.rejectUnauthorized
}

// eslint-disable-next-line no-shadow
module.exports = function createApp({ signInService, services }) {
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
  ejsSetup(app, path)
  app.use(setUpAuth(services.userAuthenticationService))

  // Add services to server
  app.set('DataServices', {
    userAuthenticationService,
    signInService,
  })

  // GovUK Template Configuration
  app.locals.assetPath = '/assets/'

  app.use('/', indexRouter(standardRouter(services.userAuthenticationService), services))

  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(createErrorHandler(process.env.NODE_ENV === 'production'))

  return app
}
