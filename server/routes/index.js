const express = require('express');

module.exports = function Index({logger, calendarService}) {

  const router = express.Router();

  router.get('/calendar/:date', async (req, res) => {
    logger.info('GET calendar view');
    const apiResponse = await calendarService.getCalendarData(req.session.uid, req.params.date);
    res.render('pages/calendar', {tab: 'Calendar', data: apiResponse, uid: req.session.uid, csrfToken: req.csrfToken()});
  });

  router.get('/details/:date', async (req, res) => {
    logger.info('GET calendar details');
    const apiResponse = await calendarService.getCalendarDetails(req.session.uid, req.params.date);
    res.render('pages/calendar-details', {data: apiResponse, uid: req.session.uid, csrfToken: req.csrfToken()});
  });

  router.get('/notifications', (req, res) => {
    logger.info('GET notifications view');
    res.render('pages/notifications', {tab: 'Notifications', uid: req.session.uid, csrfToken: req.csrfToken()});
  });

  router.get('/notifications/settings', (req, res) => {
    logger.info('GET notifications view');
    res.render('pages/notification-settings', {uid: req.session.uid, csrfToken: req.csrfToken()});
  });

  router.post('/notifications/settings', (req, res) => {
    logger.info('POST notifications view');
    res.redirect('/notifications');
  });

  router.get('/maintenance', (req, res) => {
    logger.info('GET maintenance view');
    res.render('pages/maintenance', {uid: req.session.uid, csrfToken: req.csrfToken()});
  });

  router.get('*', function(req, res) {
    logger.info('Catch and redirect to current month view');
    res.redirect('/calendar/' + [new Date().getFullYear(), ('0' + (new Date().getMonth() + 1)).slice(-2), '01'].join('-'));
  });

  return router;
};
