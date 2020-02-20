const createApp = require('./app')
const createSignInService = require('./authentication/signInService')
const logger = require('../log')
const calendarService = require('./services/calendarService')
const notificationService = require('./services/notificationService')

// pass in dependencies of service
const app = createApp(
  {
    signInService: createSignInService(),
  },
  logger,
  calendarService(),
  notificationService()
)

module.exports = app
