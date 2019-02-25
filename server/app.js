const express = require('express'),
  addRequestId = require('express-request-id')(),
  helmet = require('helmet'),
  csurf = require('csurf'),
  compression = require('compression'),
  passport = require('passport'),
  bodyParser = require('body-parser'),
  cookieSession = require('cookie-session'),
  cookieParser = require('cookie-parser'),
  createIndexRouter = require('./routes/index'),
  sassMiddleware = require('node-sass-middleware'),
  moment = require('moment'),
  path = require('path'),
  log = require('bunyan-request-logger')(),
  logger = require('../log.js'),
  config = require('../server/config'),
  session = require('./session'),
  authentication = require('./controllers/authentication');

const version = moment.now().toString(),
  production = process.env.NODE_ENV === 'production',
  testMode = process.env.NODE_ENV === 'test';

module.exports = function createApp({ logger, calendarService }) { // eslint-disable-line no-shadow

  const app = express();

  app.set('json spaces', 2);

  // Configure Express for running behind proxies
  // https://expressjs.com/en/guide/behind-proxies.html
  app.set('trust proxy', true);

  // View Engine Configuration
  app.set('views', path.join(__dirname, '../server/views'));
  app.set('view engine', 'ejs');

  // Server Configuration
  app.set('port', process.env.PORT || 3000);

  // Secure code best practice - see:
  // 1. https://expressjs.com/en/advanced/best-practice-security.html,
  // 2. https://www.npmjs.com/package/helmet
  app.use(helmet());

  // Ensure the application uses SSL
  app.use(function(req, res, next) {
    if (production && !req.secure) {
      const redirectUrl = `https://${req.hostname}${req.url}`;
      logger.info(`Redirecting to ${redirectUrl}`);
      return res.redirect(redirectUrl);
    }
    next();
  });

  app.use(addRequestId);

  // csrfProtection uses cookie
  app.use(cookieParser());

  app.use(cookieSession({
    name: 'session',
    keys: [config.sessionSecret],
    maxAge: 60 * 60 * 1000,
    secure: config.https,
    httpOnly: true,
    signed: true,
    overwrite: true,
    sameSite: 'lax',
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Request Processing Configuration
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(log.requestLogger());

  // Resource Delivery Configuration
  app.use(compression());

  // Cachebusting version string
  if (production) {
    // Version only changes on reboot
    app.locals.version = version;
  } else {
    // Version changes every request
    app.use((req, res, next) => {
      res.locals.version = moment.now().toString();
      return next();
    });
  }

  if (!production) {
    app.use('/public', sassMiddleware({
      src: path.join(__dirname, '../sass'),
      dest: path.join(__dirname, '../assets/stylesheets'),
      debug: true,
      outputStyle: 'compressed',
      prefix: '/stylesheets/',
      includePaths: [

      ],
    }));
  }

  //  Static Resources Configuration
  const cacheControl = { maxAge: config.staticResourceCacheDuration * 1000 };
  app.use('/public', express.static(path.join(__dirname, '../assets'), cacheControl));
  app.use('*/images',express.static(path.join(__dirname, '../assets/images'), cacheControl));
  app.use('*/fonts',express.static(path.join(__dirname, '../assets/fonts'), cacheControl));

  function addTemplateVariables(req, res, next) {
    res.locals.user = req.user;
    next();
  }

  app.use(addTemplateVariables);

  // Don't cache dynamic resources
  app.use(helmet.noCache());

  // CSRF protection
  if (!testMode) {
    app.use(csurf({ cookie: true }));
  }

  app.use('/auth', session.loginMiddleware, authentication.router);

  app.use(session.hmppsSessionMiddleWare);
  app.use(session.extendHmppsCookieMiddleWare);

  // Routing
  app.use('/', createIndexRouter({ logger, calendarService }));

  app.use(renderErrors);

  return app;
};


function renderErrors(error, req, res, next) { // eslint-disable-line no-unused-vars
  logger.error(error);

  // code to handle unknown errors

  res.locals.error = error;
  res.locals.stack = production ? null : error.stack;
  res.locals.message = production ?
    'Something went wrong. The error has been logged. Please try again' : error.message;

  res.status(error.status || 500);

  res.render('pages/error');
}
