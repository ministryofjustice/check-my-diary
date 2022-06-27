import { NextFunction, Request, Response } from 'express'
import moment from 'moment'

import { appendUserErrorMessage, processDetail, sortByDisplayType } from '../helpers/utilities'

export default class CalendarDetailController {
  async details(req: Request, res: Response, next: NextFunction) {
    const {
      app,
      user: { token, employeeName },
      params: { date },
      authUrl,
    } = req

    const { calendarService } = app.get('DataServices')

    try {
      const {
        date: currentDate,
        fullDayType,
        fullDayTypeDescription,
        details: rawDetails,
      } = await calendarService.getCalendarDay(date, token)
      const todayMoment = moment(currentDate)
      const backLink = `/calendar/${todayMoment.clone().format('YYYY-MM-01')}`
      const yesterdayMoment = todayMoment.clone().subtract('1', 'd')
      const tomorrowMoment = todayMoment.clone().add('1', 'd')
      let details = rawDetails.filter(({ start = '', end = '' }) => start !== end)
      if (details.length > 0) {
        sortByDisplayType(details)
        details = details.flatMap(processDetail)
      }
      res.render('pages/calendar-details', {
        ...res.locals,
        details,
        backLink,
        fullDayType,
        fullDayTypeDescription,
        today: todayMoment.format('dddd, Do MMMM YYYY'),
        yesterday: { link: yesterdayMoment.format('YYYY-MM-DD'), text: yesterdayMoment.format('dddd, Do') },
        tomorrow: { link: tomorrowMoment.format('YYYY-MM-DD'), text: tomorrowMoment.format('dddd, Do') },
        employeeName,
        authUrl,
      })
    } catch (error) {
      next(appendUserErrorMessage(error))
    }
  }
}
