const createApp = require('./app');
const logger = require('../log');

const calendar = require('./services/calendarService');

// pass in dependencies of service
const calendarService = calendar();

const app = createApp({
  logger,
  calendarService
});

module.exports = app;
