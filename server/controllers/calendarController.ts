import moment from 'moment'
import { Request, Response } from 'express'
import logger from '../../log'
import { configureCalendar, hmppsAuthMFAUser, processDay } from '../helpers/utilities'
import { SMS } from '../helpers/constants'
import mfaBannerType from '../helpers/mfaBannerType'
import type { CalendarService } from '../services'

const { EXISTING_USER, NEW_USER, FIRST_TIME_USER } = mfaBannerType

export default class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  async getDate(req: Request, res: Response) {
    const {
      app,
      user: { token, employeeName, username },
      params: { date },
      authUrl,
    } = req

    logger.info({ user: username, date }, 'GET calendar view')

    const { notificationService, userAuthenticationService, signInService, notificationCookieService } =
      app.get('DataServices')

    const isMfa = hmppsAuthMFAUser(token)

    const [notificationCount, preferences, month, authMfa, userAuthenticationDetails] = await Promise.all([
      notificationService.countUnprocessedNotifications(token),
      notificationService.getPreferences(token),
      this.calendarService.getCalendarMonth(date, token),
      isMfa ? signInService.getMyMfaSettings(token) : {},
      isMfa ? userAuthenticationService.getUserAuthenticationDetails(username) : [],
    ])

    const computeBanner = () => {
      const alreadyDismissedExisting = notificationCookieService.alreadyDismissed(req, EXISTING_USER)
      const alreadyDismissedNew = notificationCookieService.alreadyDismissed(req, NEW_USER)

      if (!isMfa) {
        return ''
      }
      if (userAuthenticationDetails && userAuthenticationDetails.length > 0) {
        if (!alreadyDismissedExisting) {
          return EXISTING_USER
        }
      } else if (authMfa.backupVerified || authMfa.mobileVerified) {
        if (!alreadyDismissedNew) {
          return NEW_USER
        }
      } else {
        return FIRST_TIME_USER
      }
      return ''
    }

    month.forEach(processDay)
    const showBanner = {
      notifications: preferences.preference === SMS,
      mfa: computeBanner(),
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
      mfaBannerType,
    })
  }
}
