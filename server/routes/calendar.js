const router = require('express').Router()
const moment = require('moment')
const { processOvertimeShifts, getStartMonth } = require('../helpers/utilities')
const logger = require('../../log')

router.get(
  '/:date',
  async ({ app, user: { employeeName, token }, params: { date }, hmppsAuthMFAUser, authUrl }, res, next) => {
    const {
      locals: { csrfToken },
    } = res
    logger.info('GET calendar view')
    const {
      calendarService: { getCalendarData },
      calendarOvertimeService: { getCalendarOvertimeData },
      notificationService: { countUnprocessedNotifications },
    } = app.get('DataServices')

    try {
      const [notificationCount, apiShiftsResponse, apiOvertimeShiftsResponse] = await Promise.all([
        countUnprocessedNotifications(token),
        getCalendarData(date, token),
        getCalendarOvertimeData(date, token),
      ])
      const results = processOvertimeShifts(apiShiftsResponse, apiOvertimeShiftsResponse)

      res.render('pages/calendar', {
        notificationCount,
        tab: 'Calendar',
        startDate: moment(date),
        data: results,
        employeeName,
        csrfToken,
        hmppsAuthMFAUser,
        authUrl,
      })
    } catch (error) {
      next(error)
    }
  },
)

// eslint-disable-next-line func-names
router.get('/', function (req, res) {
  logger.info('Catch and redirect to current month view')
  res.redirect(`/calendar/${getStartMonth()}`)
})

module.exports = router
