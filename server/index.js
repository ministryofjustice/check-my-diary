const createApp = require('./app'),
  logger = require('../log'),
  calendar = require('./services/calendarService');

// pass in dependencies of service
const calendarService = calendar();

const app = createApp({
  logger,
  calendarService
});

module.exports = app;
