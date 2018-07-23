const createApp = require('./app');
const logger = require('../log');

const calendarService = require('./services/calendarService');

// pass in dependencies of service
const someService = calendarService();

const app = createApp({
  logger,
  someService,
});

module.exports = app;
