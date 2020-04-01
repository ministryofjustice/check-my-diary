const express = require('express')
const addRequestId = require('express-request-id')()
const helmet = require('helmet')
const csurf = require('csurf')
const path = require('path')
const moment = require('moment')
const compression = require('compression')
const passport = require('passport')
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')
const sassMiddleware = require('node-sass-middleware')

const cookieParser = require('cookie-parser')
const healthcheckFactory = require('./services/healthcheck')
const createLoginRouter = require('./routes/login')
const createCalendarRouter = require('./routes/calendar')
const createCalendarDetailRouter = require('./routes/calendar-detail')
const createMaintenanceRouter = require('./routes/maintenance')
const createNotificationRouter = require('./routes/notification')
const standardRouter = require('./routes/standardRouter')
const logger = require('../log.js')
const auth = require('./authentication/auth')
const config = require('../config')

const { authenticationMiddleware } = auth

const version = moment.now().toString()
const production = process.env.NODE_ENV === 'production'
const testMode = process.env.NODE_ENV === 'test'

if (config.rejectUnauthorized) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = config.rejectUnauthorized
}

// eslint-disable-next-line no-shadow
module.exports = function createApp({ signInService }, logger, calendarService, notificationService) {
  const app = express()

  auth.init(signInService)

  app.set('json spaces', 2)

  // Configure Express for running behind proxies
  // https://expressjs.com/en/guide/behind-proxies.html
  app.set('trust proxy', true)

  // View Engine Configuration
  app.set('views', path.join(__dirname, '../server/views'))
  app.set('view engine', 'ejs')

  // Server Configuration
  app.set('port', config.port || 3005)

  // Secure code best practice - see:
  // 1. https://expressjs.com/en/advanced/best-practice-security.html,
  // 2. https://www.npmjs.com/package/helmet
  app.use(helmet())

  app.use(addRequestId)

  app.use(cookieParser())

  app.use(
    cookieSession({
      name: 'session',
      keys: [config.sessionSecret],
      maxAge: 60 * 60 * 1000,
      secure: config.https,
      httpOnly: true,
      signed: true,
      overwrite: true,
      sameSite: 'lax',
    }),
  )

  app.use(passport.initialize())
  app.use(passport.session())

  // Request Processing Configuration
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  // Resource Delivery Configuration
  app.use(compression())

  // Cachebusting version string
  if (production) {
    // Version only changes on reboot
    app.locals.version = version
  } else {
    // Version changes every request
    app.use((req, res, next) => {
      res.locals.version = moment.now().toString()
      return next()
    })
  }

  if (!production) {
    app.use(
      '/public',
      sassMiddleware({
        src: path.join(__dirname, '../assets/sass'),
        dest: path.join(__dirname, '../assets/stylesheets'),
        debug: true,
        outputStyle: 'compressed',
        prefix: '/stylesheets/',
        includePaths: ['node_modules/govuk-frontend'],
      }),
    )
  }

  //  Static Resources Configuration
  const cacheControl = { maxAge: config.staticResourceCacheDuration * 1000 }

  ;[
    '../assets',
    '../assets/stylesheets',
    '../node_modules/govuk-frontend/assets',
    '../node_modules/govuk-frontend',
  ].forEach(dir => {
    app.use('/public', express.static(path.join(__dirname, dir), cacheControl))
  })
  ;['../node_modules/govuk_frontend_toolkit/images'].forEach(dir => {
    app.use('/public/images/icons', express.static(path.join(__dirname, dir), cacheControl))
  })

  app.use('/public', express.static(path.join(__dirname, '../assets'), cacheControl))
  app.use('*/images', express.static(path.join(__dirname, '../assets/images'), cacheControl))

  const healthcheck = healthcheckFactory(config.nomis.authUrl)

  // Express Routing Configuration
  app.get('/health', (req, res, next) => {
    healthcheck((err, result) => {
      if (err) {
        return next(err)
      }
      if (!result.healthy) {
        res.status(503)
      }
      res.json(result)
      return result
    })
  })
  app.get('/ping', (req, res) => res.send('pong'))

  // GovUK Template Configuration
  app.locals.asset_path = '/assets/'

  function addTemplateVariables(req, res, next) {
    res.locals.user = req.user
    next()
  }

  app.use(addTemplateVariables)

  // Don't cache dynamic resources
  app.use(helmet.noCache())

  // CSRF protection
  if (!testMode) {
    app.use(csurf())
  }

  // token refresh
  app.use(async (req, res, next) => {
    if (req.user && req.originalUrl !== '/logout') {
      const timeToRefresh = new Date() > req.user.refreshTime
      if (timeToRefresh) {
        try {
          const newToken = await signInService.getRefreshedToken(req.user)
          req.user.token = newToken.token
          req.user.refreshToken = newToken.refreshToken
          logger.info(`existing refreshTime in the past by ${new Date() - req.user.refreshTime}`)
          logger.info(
            `updating time by ${newToken.refreshTime - req.user.refreshTime} from ${req.user.refreshTime} to ${
              newToken.refreshTime
            }`,
          )
          req.user.refreshTime = newToken.refreshTime
        } catch (error) {
          logger.error(`Token refresh error: ${req.user.username}`, error.stack)
          return res.redirect('/logout')
        }
      }
    }
    return next()
  })

  // Update a value in the cookie so that the set-cookie will be sent.
  // Only changes every minute so that it's not sent with every request.
  app.use((req, res, next) => {
    req.session.nowInMinutes = Math.floor(Date.now() / 60e3)
    next()
  })

  const authLogoutUrl = `${config.nomis.authExternalUrl}/logout?client_id=${config.nomis.apiClientId}&redirect_uri=${config.app.url}`

  app.get('/autherror', (req, res) => {
    res.status(401)
    return res.render('autherror', {
      authURL: authLogoutUrl,
    })
  })

  app.get('/login', passport.authenticate('oauth2'))

  app.get('/login/callback', (req, res, next) =>
    passport.authenticate('oauth2', {
      successReturnToOrRedirect: req.session.returnTo || '/',
      failureRedirect: '/autherror',
    })(req, res, next),
  )

  app.use('/logout', (req, res) => {
    if (req.user) {
      req.logout()
    }
    res.redirect(authLogoutUrl)
  })

  const standardRoute = standardRouter({ authenticationMiddleware })

  // Routing
  app.use('/', standardRoute(createLoginRouter()))
  app.use('/calendar', authHandler, standardRoute(createCalendarRouter(logger, calendarService, notificationService)))
  app.use('/details', authHandler, standardRoute(createCalendarDetailRouter(logger, calendarService)))
  app.use('/notifications', authHandler, standardRoute(createNotificationRouter(logger, notificationService)))
  app.use(
    '/maintenance',
    authHandler,
    standardRoute(createMaintenanceRouter(logger, calendarService, notificationService)),
  )

  app.use((req, res, next) => {
    next(new Error('Not found'))
  })

  app.use(renderErrors)

  return app
}

// eslint-disable-next-line no-unused-vars
function renderErrors(error, req, res, next) {
  logger.error(error)
  res.locals.error = error
  res.locals.stack = production ? null : error.stack
  res.locals.message = production ? 'Something went wrong. The error has been logged. Please try again' : error.message

  res.status(error.status || 500)

  res.render('pages/error', { csrfToken: res.locals.csrfToken })
}

function authHandler(req, res, next) {
  if (req.user.apiUrl !== undefined) {
    if (new Date() > new Date(req.user.sessionExpires)) {
      res.redirect('/logout')
    } else {
      next()
    }
  } else {
    res.redirect('/login')
  }
}
