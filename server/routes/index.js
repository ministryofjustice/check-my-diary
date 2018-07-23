const express = require('express');

module.exports = function Index({logger, someService}) {
  const router = express.Router();

  router.get('/', (req, res) => {
    logger.info('GET index');

    const data = someService.getSomeData();

    res.render('pages/index', {data});
  });

  router.post('/', (req, res) => {
    res.redirect('/calendar');
  });

  router.get('/calendar', (req, res) => {
    logger.info('GET calendar view');
    const data = someService.getCalendarData();


    res.render('pages/calendar', {tab: 'Calendar', data: data});
  });

  router.get('/calendar/details/:date', (req, res) => {
    logger.info('GET calendar details');


    res.render('pages/calendar-details');
  });

  router.get('/notifications', (req, res) => {
    logger.info('GET notifications view');


    res.render('pages/notifications', {tab: 'Notifications'});
  });

  router.get('/notifications/settings', (req, res) => {
    logger.info('GET notifications view');


    res.render('pages/notification-settings');
  });

  router.get('/maintenance', (req, res) => {
    logger.info('GET maintenance view');


    res.render('pages/maintenance');
  });

  return router;
};
