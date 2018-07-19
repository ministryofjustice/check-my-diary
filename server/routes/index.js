const express = require('express');

module.exports = function Index({ logger, someService }) {
  const router = express.Router();

  router.get('/', (req, res) => {
    logger.info('GET index');

    const data = someService.getSomeData();

    res.render('pages/index', { data });
  });
	
  router.get('/calendar', (req, res) => {
    logger.info('GET calendar view');


    res.render('pages/calendar');
  });
	
  router.get('/calendar/details/:date', (req, res) => {
    logger.info('GET calendar details');


    res.render('pages/calendar-details');
  });

  return router;
};
