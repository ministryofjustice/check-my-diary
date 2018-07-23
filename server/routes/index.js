const express = require('express');

module.exports = function Index({logger}) {
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
    res.render('pages/calendar', {tab: 'Calendar', csrfToken: req.csrfToken()});
  });

  router.get('/calendar/details/:date', (req, res) => {
    logger.info('GET calendar details');
    res.render('pages/calendar-details', {csrfToken: req.csrfToken()});
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
