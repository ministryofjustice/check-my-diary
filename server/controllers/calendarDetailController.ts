import { NextFunction, Request, Response } from 'express'
import moment from 'moment'

import { processDetail, sortByDisplayType } from '../helpers/utilities'
import type { CalendarService } from '../services'

export default class CalendarDetailController {
  constructor(private readonly calendarService: CalendarService) {}

  async details(req: Request, res: Response) {
    const {
      app,
      user: { token, employeeName },
      params: { date },
      authUrl,
    } = req

    const {
      date: currentDate,
      fullDayType,
      fullDayTypeDescription,
      details: rawDetails,
    } = await this.calendarService.getCalendarDay(date, token)
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
  }
}
