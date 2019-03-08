const express = require('express');

module.exports = function Index({logger, calendarService}) {

  const router = express.Router();

  /**
   * Gets the current month as a date string (YYYY-MM-DD)
   * @returns {string}
   */
  function getStartMonth() {
    const now = new Date();
    return [now.getFullYear(), ('0' + (now.getMonth() + 1)).slice(-2), '01'].join('-');
  }

  /**
   * Service unavailable
   * @param req
   * @param res
   */
  function serviceUnavailable(req, res) {
    logger.error('Service unavailable');
    res.render('pages/index', {
      authError: false,
      apiUp: false,
      csrfToken: req.csrfToken()
    });
  }

  router.get('/calendar/:date', async (req, res) => {
    logger.info('GET calendar view');
    try {
      const apiResponse = await calendarService.getCalendarData(req.session.uid, req.params.date, req.session.cookieData.access_token);
      res.render('pages/calendar', {tab: 'Calendar', startDate: req.params.date, data: apiResponse, uid: req.session.uid, employeeName: req.session.employeeName, csrfToken: req.csrfToken()});
    } catch (error) {
      serviceUnavailable(req, res);
    }
  });

  router.get('/details/:date', async (req, res) => {
    logger.info('GET calendar details');
    try {
      const apiResponse = await calendarService.getCalendarDetails(req.session.uid, req.params.date, req.session.cookieData.access_token);
      
      res.render('pages/calendar-details', {data: apiResponse, uid: req.session.uid, employeeName: req.session.employeeName, csrfToken: req.csrfToken()});
    } catch (error) {
      serviceUnavailable(req, res);
    }
  });

  router.get('/notifications', (req, res) => {
    logger.info('GET notifications view');
    res.render('pages/notifications', {tab: 'Notifications', uid: req.session.uid, employeeName: req.session.employeeName, csrfToken: req.csrfToken()});
  });

  router.get('/notifications/settings', (req, res) => {
    logger.info('GET notifications view');
    res.render('pages/notification-settings', {uid: req.session.uid, employeeName: req.session.employeeName, csrfToken: req.csrfToken()});
  });

  router.post('/notifications/settings', (req, res) => {
    logger.info('POST notifications view');
    res.redirect('/notifications');
  });

  router.get('/maintenance', (req, res) => {
    logger.info('GET maintenance view');
    res.render('pages/maintenance', {uid: req.session.uid, employeeName: req.session.employeeName, csrfToken: req.csrfToken()});
  });

  router.get('*', function(req, res) {
    logger.info('Catch and redirect to current month view');
    res.redirect(`/calendar/${getStartMonth()}`);
  });

  return router;
};
