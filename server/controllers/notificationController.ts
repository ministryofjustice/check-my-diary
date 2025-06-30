import type { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { add, formatISO } from 'date-fns'
import NotificationType from '../helpers/NotificationType'
import utilities from '../helpers/utilities'
import NotificationService from '../services/notificationService'

export default class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  async getNotifications({ user }: Request, res: Response): Promise<void> {
    if (!user) return
    const data = await this.notificationService.getNotifications(user.token)

    data.sort(({ shiftModified: first }, { shiftModified: second }) => second.localeCompare(first))

    res.render('pages/notifications.njk', { data })
  }

  async resume({ user }: Request, res: Response): Promise<void> {
    if (user) {
      await this.notificationService.resumeNotifications(user.token)
      res.redirect('back')
    }
  }

  async getManage({ user }: Request, res: Response): Promise<void> {
    if (!user) return

    const { snoozeUntil, notificationsEnabled } = await this.getSnoozeAndNotificationSettings(user.token)

    res.render('pages/manage-your-notifications.njk', {
      notificationsEnabled,
      snoozeUntil,
    })
  }

  async getPause(req: Request, res: Response): Promise<void> {
    const {
      user,
      query: { pauseUnit, pauseValue },
    } = req

    if (!user) return
    const { snoozeUntil, notificationsEnabled } = await this.getSnoozeAndNotificationSettings(user.token)

    const errors = validationResult(req)

    res.render('pages/pause-notifications.njk', {
      errors,
      notificationsEnabled,
      snoozeUntil,
      pauseUnit,
      pauseValue,
    })
  }

  async setPause(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req)
    const {
      user,
      body: { pauseUnit, pauseValue },
    } = req

    if (!user) return

    if (!errors.isEmpty()) {
      const { snoozeUntil, notificationsEnabled } = await this.getSnoozeAndNotificationSettings(user.token)
      res.render('pages/pause-notifications.njk', {
        errors,
        notificationsEnabled,
        snoozeUntil,
        pauseUnit,
        pauseValue,
      })
    } else {
      await this.notificationService.updateSnooze(
        user.token,
        NotificationController.getFormattedFutureDate(pauseUnit, Number(pauseValue)),
      )
      res.redirect('/notifications/manage')
    }
  }

  private static getFormattedFutureDate(pauseUnit: string, pauseValue: number) {
    const duration = { [pauseUnit]: pauseValue }
    return formatISO(add(new Date(), duration), { representation: 'date' })
  }

  private async getSnoozeAndNotificationSettings(token: string) {
    const { snoozeUntil: rawSnoozeUntil, preference = NotificationType.NONE } =
      await this.notificationService.getPreferences(token)
    const notificationsEnabled = preference !== NotificationType.NONE
    const snoozeUntil = notificationsEnabled && rawSnoozeUntil ? utilities.getSnoozeUntil(rawSnoozeUntil) : ''
    return { snoozeUntil, notificationsEnabled }
  }
}
