const express = require('express')
const csurf = require('csurf')
const path = require('path')

const { setUpHealthChecks } = require('./middleware/setUpHealthChecks')
const { setUpStaticResources } = require('./middleware/setUpStaticResources')
const loginRouter = require('./routes/login')
const calendarRouter = require('./routes/calendar')
const maintenance = require('./middleware/maintenance')
const contactUs = require('./middleware/contact-us')
const notificationRouter = require('./routes/notification')
const config = require('../config')
const userAuthenticationService = require('./services/userAuthenticationService')

const tokenRefresh = require('./middleware/tokenRefresh')
const authenticationMiddleware = require('./middleware/authenticationMiddleware')

const calendarService = require('./services/calendarService')
const notificationService = require('./services/notificationService')
const authHandlerMiddleware = require('./middleware/authHandlerMiddleware')
const csrfTokenMiddleware = require('./middleware/csrfTokenMiddleware')
const errorsMiddleware = require('./middleware/errorsMiddleware')
const calendarDetailMiddleware = require('./middleware/calendarDetailMiddleware')

const testMode = process.env.NODE_ENV === 'test'

const { appendUserErrorMessage } = require('./helpers/utilities')
const { NOT_FOUND_ERROR } = require('./helpers/errorConstants')
const { ejsSetup } = require('./utils/ejsSetup')
const { setUpWebSecurity } = require('./middleware/setUpWebSecurity')
const { setUpWebSession } = require('./middleware/setUpWebSession')
const { metricsMiddleware } = require('./monitoring/metricsApp')
const { setUpWebRequestParsing } = require('./middleware/setupRequestParsing')
const { setUpAuth } = require('./middleware/setUpAuthentication')

if (config.rejectUnauthorized) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = config.rejectUnauthorized
}

// eslint-disable-next-line no-shadow
module.exports = function createApp({ signInService }) {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', config.port || 3005)

  app.use(metricsMiddleware)
  app.use(setUpHealthChecks())
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  ejsSetup(app, path)
  app.use(setUpAuth(signInService))

  // Add services to server
  app.set('DataServices', {
    calendarService,
    notificationService,
    userAuthenticationService,
  })

  app.use('*', maintenance)

  // GovUK Template Configuration
  app.locals.assetPath = '/assets/'

  // CSRF protection
  if (!testMode) {
    app.use(csurf())
  }

  // token refresh
  app.use(tokenRefresh(signInService))

  // Routing
  app.use(authenticationMiddleware, csrfTokenMiddleware)
  app.use('/auth', loginRouter)
  app.use(authHandlerMiddleware)
  app.use('/contact-us', contactUs)
  app.use('/calendar', calendarRouter)
  app.get('/details/:date([0-9]{4}-[0-9]{2}-[0-9]{2})', calendarDetailMiddleware)
  app.use('/notifications', notificationRouter)
  app.get('/', (_req, res) => res.redirect('/calendar#today'))

  app.use('*', (req, res, next) => {
    const error = new Error('Not found')
    error.status = 404
    next(appendUserErrorMessage(error, NOT_FOUND_ERROR))
  })

  app.use('*', errorsMiddleware)

  return app
}
