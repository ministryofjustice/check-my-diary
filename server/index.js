/* eslint consistent-return:0 */
require('dotenv').config()

// Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
// In particular, applicationinsights automatically collects bunyan logs
require('./azure-appinsights')

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
  notificationService(),
)

module.exports = app
