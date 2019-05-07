const createApp = require('./app'),
  logger = require('../log'),
  calendar = require('./services/calendarService');
const { notificationService } = require('./services/notificationService');
  
// pass in dependencies of service
const calendarService = calendar();
const notification = notificationService();

const app = createApp({
  logger,
  calendarService},
  notification
);

module.exports = app;
