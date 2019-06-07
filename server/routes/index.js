const express = require('express');
const { check, validationResult } = require('express-validator/check');
const scrollToElement = require('scroll-to-element');
 

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

  router.get('/notifications/settings', async (req, res) => {

    logger.info('GET notifications settings');

    const userNotificationSettings = await notificationService.getUserNotificationSettings(req.session.uid);
    
    if (userNotificationSettings === null || userNotificationSettings.length === 0) {
      res.render('pages/notification-settings', {errors : null, userNotificationSettings: null, uid: req.session.uid, employeeName: req.session.employeeName, csrfToken: req.csrfToken()});
    } else {
      res.render('pages/notification-settings', {errors : null, userNotificationSettings: userNotificationSettings[0], uid: req.session.uid, employeeName: req.session.employeeName, csrfToken: req.csrfToken()});
    }
  });

  router.post('/notifications/settings',  [

    // email address
    check('inputEmail', 'Must be a valid email address').optional({checkFalsy: true}).isEmail(),
    // mobile number    
    check('inputMobile', 'Must be a valid mobile number').optional({checkFalsy: true}).isMobilePhone('en-GB')

    ], async (req, res) => {

      logger.info('POST notifications settings');

      // Finds the validation errors in this request and wraps them in an object with handy functions
      const errors = validationResult(req);
      console.log(errors.mapped());
      if (!errors.isEmpty()) {
        
        const data = { 
          email: req.body.inputEmail, 
          optionEmail: req.body.optionEmail, 
          mobile: req.body.inputMobile, 
          optionMobile: req.body.optionMobile };

          res.render('pages/notification-settings', {errors : errors.array(), notificationSettings: data, userNotificationSettings: null, uid: req.session.uid, employeeName: req.session.employeeName, csrfToken: req.csrfToken()});
     
      } else {
        
        await notificationService.updateUserNotificationSettings(req.session.uid, req.body.inputEmail === '' ? null : req.body.inputEmail, req.body.inputMobile === '' ? null : req.body.inputMobile, req.body.optionEmail !== undefined && req.body.inputEmail != '' ? true : false, req.body.optionMobile !== undefined && req.body.inputMobile != '' ? true : false);        
        res.redirect('/notifications/settings');
      }
  });

  router.get('/notifications/:page', async (req, res) => {

    try {
      
      var reqData = req.query;
      var pagination = {};
      var perPage = reqData.perPage || 10;
      var page = parseInt(req.params.page) || 2;
      if (page < 1) page = 1;
      var offset = (page - 1) * perPage;

      Promise.all([
        notificationService.getShiftNotificationsCount(req.session.uid),
        notificationService.getShiftTaskNotificationsCount(req.session.uid),
        notificationService.getShiftNotificationsPaged(req.session.uid, offset, perPage)
      ]).then(([totalShiftNotifications, totalShiftTaskNotifications, rows]) => {

            var count = parseInt(totalShiftNotifications.count) + parseInt(totalShiftTaskNotifications.count);
            var rows = rows;
            pagination.total = count;
            pagination.per_page = perPage;
            pagination.offset = offset;
            pagination.to = offset + rows.length;
            pagination.last_page = Math.ceil(count / perPage);
            pagination.current_page = page;
            pagination.previous_page = page-1;
            pagination.next_page = page+1;
            pagination.from = offset;
            pagination.data = rows;

            res.render('pages/notifications', {data: pagination, shiftNotifications : rows, tab: 'Notifications', 
                        uid: req.session.uid, employeeName: req.session.employeeName, csrfToken: req.csrfToken()});                                        
          })

      logger.info('GET notifications view');
      
      await notificationService.updateShiftNotificationsToRead(req.session.uid);
      await notificationService.updateShiftTaskNotificationsToRead(req.session.uid);
      
    } catch (error) {
      serviceUnavailable(req, res);
    }

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
