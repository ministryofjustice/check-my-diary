import moment from 'moment'
import { Request, Response } from 'express'
import logger from '../../log'
import utilities from '../helpers/utilities'
import NotificationType from '../helpers/NotificationType'
import mfaBannerType from '../helpers/mfaBannerType'
import type { CalendarService, NotificationService, NotificationCookieService } from '../services'
import { UserAuthenticationService } from '../services'
import UserService from '../services/userService'

const { EXISTING_USER, NEW_USER, FIRST_TIME_USER } = mfaBannerType

export default class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
    private readonly notificationService: NotificationService,
    private readonly notificationCookieService: NotificationCookieService,
    private readonly userAuthenticationService: UserAuthenticationService,
    private readonly userService: UserService,
  ) {}

  async getDate(req: Request, res: Response) {
    const {
      user: { token, employeeName, username },
      params: { date },
      authUrl,
    } = req

    logger.info({ user: username, date }, 'GET calendar view')

    const isMfa = utilities.hmppsAuthMFAUser(token)

    const [notificationCount, preferences, month, userAuthenticationDetails] = await Promise.all([
      this.notificationService.countUnprocessedNotifications(token),
      this.notificationService.getPreferences(token),
      this.calendarService.getCalendarMonth(date, token),
      this.userAuthenticationService.getUserAuthenticationDetails(username),
    ])

    const notifications = preferences.preference === NotificationType.SMS

    const computeBanner = async () => {
      const alreadyDismissedExisting = this.notificationCookieService.alreadyDismissed(req, EXISTING_USER)
      const alreadyDismissedNew = this.notificationCookieService.alreadyDismissed(req, NEW_USER)

      if (userAuthenticationDetails.length > 0) {
        if (isMfa && !alreadyDismissedExisting && !notifications) {
          return EXISTING_USER
        }
      } else {
        const authMfa = await this.userService.getUserMfa(token)
        if (authMfa.backupVerified || authMfa.mobileVerified) {
          if (!alreadyDismissedNew && !notifications) {
            return NEW_USER
          }
        } else {
          return FIRST_TIME_USER
        }
      }
      return ''
    }

    const showBanner = {
      notifications,
      mfa: await computeBanner(),
    }
    const data = utilities.configureCalendar(month)
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
