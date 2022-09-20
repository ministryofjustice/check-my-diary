import { Request, Response } from 'express'
import { add, format, sub } from 'date-fns'
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
      user: { token, username },
      params: { date },
    } = req

    logger.info({ user: username, date }, 'GET calendar view')

    const isMfa = utilities.hmppsAuthMFAUser(token)

    const [preferences, month, userAuthenticationDetails] = await Promise.all([
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
    const currentMonth = new Date(date)
    const previousMonth = sub(currentMonth, { months: 1 })
    const nextMonth = add(currentMonth, { months: 1 })
    return res.render('pages/calendar.njk', {
      ...res.locals,
      tab: 'Calendar',
      currentMonth: format(currentMonth, 'MMMM yyyy'),
      previousMonth: { link: format(previousMonth, 'yyyy-MM-dd'), text: format(previousMonth, 'MMMM') },
      nextMonth: { link: format(nextMonth, 'yyyy-MM-dd'), text: format(nextMonth, 'MMMM') },
      data,
      showBanner,
      mfaBannerType,
      fromDPS: req.session.fromDPS,
    })
  }
}
