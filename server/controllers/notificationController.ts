import { Request, Response } from 'express'
import moment from 'moment'
import { validationResult } from 'express-validator'
import { add, formatISO } from 'date-fns'
import NotificationType from '../helpers/NotificationType'
import { getSnoozeUntil } from '../helpers/utilities'
import type { NotificationService } from '../services'

export default class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  async getNotifications({ user: { token } }: Request, res: Response) {
    const data = await this.notificationService.getNotifications(token)

    data.sort(({ shiftModified: first }, { shiftModified: second }) => moment(second).diff(moment(first)))

    return res.render('pages/notifications.njk', { data })
  }

  async resume({ user: { token } }: Request, res: Response) {
    await this.notificationService.resumeNotifications(token)
    res.redirect('back')
  }

  async getManage({ user: { token } }: Request, res: Response) {
    const { snoozeUntil, notificationsEnabled } = await this.getSnoozeAndNotificationSettings(token)

    return res.render('pages/manage-your-notifications.njk', {
      notificationsEnabled,
      snoozeUntil,
    })
  }

  async getPause(req: Request, res: Response) {
    const {
      user: { token },
      query: { pauseUnit, pauseValue },
    } = req

    const { snoozeUntil, notificationsEnabled } = await this.getSnoozeAndNotificationSettings(token)

    const errors = validationResult(req)

    return res.render('pages/pause-notifications.njk', {
      errors,
      notificationsEnabled,
      snoozeUntil,
      pauseUnit,
      pauseValue,
    })
  }

  async setPause(req: Request, res: Response) {
    const errors = validationResult(req)
    const {
      user: { token },
      body: { pauseUnit, pauseValue },
    } = req

    if (!errors.isEmpty()) {
      const { snoozeUntil, notificationsEnabled } = await this.getSnoozeAndNotificationSettings(token)
      return res.render('pages/pause-notifications.njk', {
        errors,
        notificationsEnabled,
        snoozeUntil,
        pauseUnit,
        pauseValue,
      })
    }
    await this.notificationService.updateSnooze(
      token,
      NotificationController.getFormattedFutureDate(pauseUnit, pauseValue),
    )
    return res.redirect('/notifications/manage')
  }

  private static getFormattedFutureDate(pauseUnit: string, pauseValue: number) {
    const duration = { [pauseUnit]: pauseValue }
    return formatISO(add(new Date(), duration), { representation: 'date' })
  }

  private async getSnoozeAndNotificationSettings(token: string) {
    const { snoozeUntil: rawSnoozeUntil, preference = NotificationType.NONE } =
      await this.notificationService.getPreferences(token)
    const notificationsEnabled = preference !== NotificationType.NONE
    const snoozeUntil = notificationsEnabled ? getSnoozeUntil(rawSnoozeUntil) : ''
    return { snoozeUntil, notificationsEnabled }
  }
}
