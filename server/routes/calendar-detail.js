const router = require('express').Router()
const moment = require('moment')
const logger = require('../../log')

router.get(
  '/:date',
  async ({ app, authUrl, hmppsAuthMFAUser, params: { date }, user: { employeeName, token } }, res, next) => {
    logger.info('GET calendar details')

    const {
      calendarService: { getCalendarDetails },
      calendarOvertimeService: { getCalendarOvertimeDetails },
    } = app.get('DataServices')

    try {
      const [apiShiftDetailsResponse, apiOvertimeShiftDetailsResponse] = await Promise.all([
        getCalendarDetails(date, token),
        getCalendarOvertimeDetails(date, token),
      ])

      res.render('pages/calendar-details', {
        data: apiShiftDetailsResponse,
        overtimeShiftDetailsData: apiOvertimeShiftDetailsResponse,
        startDate: moment(date),
        employeeName,
        csrfToken: res.locals.csrfToken,
        hmppsAuthMFAUser,
        authUrl,
        moment,
      })
    } catch (error) {
      next(error)
    }
  },
)

module.exports = router
