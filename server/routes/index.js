const express = require('express');
const moment = require('moment');
const { check, validationResult } = require('express-validator/check');

module.exports = function Index({logger, calendarService, notificationService}) {

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

      const shiftNotifications = await notificationService.getShiftNotifications(req.session.uid);

      const apiResponse = await calendarService.getCalendarData(req.session.uid, req.params.date, req.session.cookieData.access_token);
      res.render('pages/calendar', {shiftNotifications : shiftNotifications, tab: 'Calendar', startDate: req.params.date, data: apiResponse, uid: req.session.uid, employeeName: req.session.employeeName, csrfToken: req.csrfToken()});
    } catch (error) {      
      serviceUnavailable(req, res);
    }
  });

  router.get('/details/:date', async (req, res) => {
    logger.info('GET calendar details');
    try {
      const apiResponse = await calendarService.getCalendarDetails(req.session.uid, req.params.date, req.session.cookieData.access_token);
      
      res.render('pages/calendar-details', {data: apiResponse, date: req.params.date, uid: req.session.uid, employeeName: req.session.employeeName, csrfToken: req.csrfToken()});
    } catch (error) {
      serviceUnavailable(req, res);
    }
  });

  router.get('/notifications', async (req, res) => {

    try {
      const shiftNotifications = await notificationService.getShiftNotifications(req.session.uid);
      
      logger.info('GET notifications view');
      res.render('pages/notifications', {moment: moment, shiftNotifications : shiftNotifications, tab: 'Notifications', uid: req.session.uid, employeeName: req.session.employeeName, csrfToken: req.csrfToken()});
      
      await notificationService.updateShiftNotificationsToRead(req.session.uid);
    } catch (error) {
      serviceUnavailable(req, res);
    }

  });

  router.get('/notifications/settings', async (req, res) => {

    logger.info('GET notifications settings');

    const userNotificationSettings = await notificationService.getUserNotificationSettings(req.session.uid);
    
    if (userNotificationSettings === null || userNotificationSettings.length === 0) {
      res.render('pages/notification-settings', {userNotificationSettings: null, uid: req.session.uid, employeeName: req.session.employeeName, csrfToken: req.csrfToken()});
    } else {
      res.render('pages/notification-settings', {userNotificationSettings: userNotificationSettings[0], uid: req.session.uid, employeeName: req.session.employeeName, csrfToken: req.csrfToken()});
    }
  });

  router.post('/notifications/settings', [
    // email address
    check('inputEmail', 'Email address is invalid!').isEmail(),
    // mobile number
    check('inputMobile', 'Must be only numeric').isNumeric(),
    check('inputMobile', 'Must be only be a valid mobile number').isMobilePhone('en-GB')

    ], async (req, res) => {
      // Finds the validation errors in this request and wraps them in an object with handy functions
      const errors = validationResult(req);
      console.log(errors.mapped());
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      
      

    logger.info('POST notifications settings');

    await notificationService.updateUserNotificationSettings(req.session.uid, req.body.inputEmail === '' ? null : req.body.inputEmail, req.body.inputMobile === '' ? null : req.body.inputMobile, req.body.optionEmail !== undefined ? true : false, req.body.optionMobile !== undefined ? true : false);


    res.redirect('/notifications/settings');
    
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
