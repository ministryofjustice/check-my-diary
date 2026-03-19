import type { Request, Response } from 'express'
import { add, format, sub } from 'date-fns'
import logger from '../../logger'
import utilities from '../helpers/utilities'
import mfaBannerType from '../helpers/mfaBannerType'
import CalendarService from '../services/calendarService'
import NotificationCookieService from '../services/notificationCookieService'

const { SMS_BANNER, EXISTING_USER, NEW_USER } = mfaBannerType

export default class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
    private readonly notificationCookieService: NotificationCookieService,
  ) {}

  async getDate(req: Request, res: Response): Promise<void> {
    const {
      user,
      params: { date },
    } = req

    if (!user) return
    const { username } = user
    logger.info({ user: username, date }, 'GET calendar view')

    const month = await this.calendarService.getCalendarMonth(date.toString(), username)

    const notifications = !this.notificationCookieService.alreadyDismissed(req, SMS_BANNER)

    const computeBanner = async () => {
      const alreadyDismissedExisting = this.notificationCookieService.alreadyDismissed(req, EXISTING_USER)
      const alreadyDismissedNew = this.notificationCookieService.alreadyDismissed(req, NEW_USER)

      return alreadyDismissedNew || alreadyDismissedExisting ? '' : NEW_USER
    }

    const showBanner = {
      notifications,
      mfa: await computeBanner(),
    }
    const data = utilities.configureCalendar(month)
    const currentMonth = new Date(date.toString())
    const previousMonth = sub(currentMonth, { months: 1 })
    const nextMonth = add(currentMonth, { months: 1 })
    res.render('pages/calendar.njk', {
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
