const express = require('express');

module.exports = function Index({logger, calendarService}) {
  const router = express.Router();

  router.get('/', (req, res) => {
    logger.info('GET index');
    res.render('pages/index', {csrfToken: req.csrfToken()});
  });

  router.post('/', (req, res) => {
    res.redirect('/calendar');
  });

  router.get('/calendar', (req, res) => {
    logger.info('GET calendar view');
    const data = calendarService.getCalendarData();
    res.render('pages/calendar', {tab: 'Calendar', data: data, csrfToken: req.csrfToken()});
  });

  router.get('/calendar/details/:date', (req, res) => {
    logger.info('GET calendar details');
    const data = calendarService.getCalendarDetails(req.params.date);
    res.render('pages/calendar-details', {data: data, csrfToken: req.csrfToken()});
  });

  router.get('/notifications', (req, res) => {
    logger.info('GET notifications view');
    res.render('pages/notifications', {tab: 'Notifications', csrfToken: req.csrfToken()});
  });

  router.get('/notifications/settings', (req, res) => {
    logger.info('GET notifications view');
    res.render('pages/notification-settings', {csrfToken: req.csrfToken()});
  });

  router.get('/maintenance', (req, res) => {
    logger.info('GET maintenance view');
    res.render('pages/maintenance', {csrfToken: req.csrfToken()});
  });

  return router;
};
