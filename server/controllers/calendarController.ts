import moment from 'moment'
import { Request, Response, NextFunction } from 'express'
import logger from '../../log'
import { appendUserErrorMessage, configureCalendar, hmppsAuthMFAUser, processDay } from '../helpers/utilities'
import { SMS } from '../helpers/constants'

export default class CalendarController {
  async getDate(req: Request, res: Response, next: NextFunction) {
    const {
      app,
      user: { token, employeeName, username },
      params: { date },
      authUrl,
    } = req

    logger.info({ user: username, date }, 'GET calendar view')

    const { calendarService, notificationService, userAuthenticationService, signInService } = app.get('DataServices')

    try {
      const isMfa = hmppsAuthMFAUser(token)

      const [notificationCount, preferences, month, mfa, userAuthenticationDetails] = await Promise.all([
        notificationService.countUnprocessedNotifications(token),
        notificationService.getPreferences(token),
        calendarService.getCalendarMonth(date, token),
        isMfa ? signInService.getMyMfaSettings(token) : {},
        isMfa ? userAuthenticationService.getUserAuthenticationDetails(username) : [],
      ])

      let mfaBanner = ''
      if (isMfa) {
        if (userAuthenticationDetails && userAuthenticationDetails.length > 0) {
          mfaBanner = 'EXISTING_USER'
        } else if (mfa.backupVerified || mfa.mobileVerified) {
          mfaBanner = 'NEW_USER'
        } else {
          mfaBanner = 'FIRST_TIME_USER'
        }
      }

      month.forEach(processDay)
      const showBanner = {
        notifications: preferences.preference === SMS,
        mfa: mfaBanner,
      }
      const data = configureCalendar(month)
      const currentMonthMoment = moment(date)
      const previousMonthMoment = currentMonthMoment.clone().subtract('1', 'M')
      const nextMonthMoment = currentMonthMoment.clone().add('1', 'M')
      return res.render('pages/calendar', {
        ...res.locals,
        notificationCount,
        tab: 'Calendar',
        currentMonth: currentMonthMoment.format('MMMM YYYY'),
        previousMonth: { link: previousMonthMoment.format('YYYY-MM-DD'), text: previousMonthMoment.format('MMMM') },
        nextMonth: { link: nextMonthMoment.format('YYYY-MM-DD'), text: nextMonthMoment.format('MMMM') },
        data,
        employeeName,
        authUrl,
        showBanner,
      })
    } catch (error) {
      return next(appendUserErrorMessage(error))
    }
  }
}
