import type { Request, Response } from 'express'
import { add, format, sub } from 'date-fns'
import logger from '../../log'
import utilities from '../helpers/utilities'
import mfaBannerType from '../helpers/mfaBannerType'
import type { CalendarService, NotificationCookieService } from '../services'
import UserService from '../services/userService'

const { SMS_BANNER, EXISTING_USER, NEW_USER, FIRST_TIME_USER } = mfaBannerType

export default class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
    private readonly notificationCookieService: NotificationCookieService,
    private readonly userService: UserService,
  ) {}

  async getDate(req: Request, res: Response) {
    const {
      user,
      params: { date },
    } = req

    if (!user) return false
    const { username, token } = user
    logger.info({ user: username, date }, 'GET calendar view')

    const month = await this.calendarService.getCalendarMonth(date, token)

    const notifications = !this.notificationCookieService.alreadyDismissed(req, SMS_BANNER)

    const computeBanner = async () => {
      const alreadyDismissedExisting = this.notificationCookieService.alreadyDismissed(req, EXISTING_USER)
      const alreadyDismissedNew = this.notificationCookieService.alreadyDismissed(req, NEW_USER)

      const authMfa = await this.userService.getUserMfa(token)
      if (authMfa.backupVerified || authMfa.mobileVerified) {
        return alreadyDismissedNew || alreadyDismissedExisting ? '' : NEW_USER
      }
      return FIRST_TIME_USER
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
