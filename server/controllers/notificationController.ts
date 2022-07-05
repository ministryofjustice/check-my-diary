import { Request, Response } from 'express'
import moment from 'moment'
import { validationResult } from 'express-validator'
import { add, formatISO } from 'date-fns'
import NotificationType from '../helpers/NotificationType'
import { getSnoozeUntil } from '../helpers/utilities'
import type { NotificationService } from '../services'

export default class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  async getNotifications(req: Request, res: Response) {
    const {
      user: { employeeName, token },
      authUrl,
    } = req

    const {
      locals: { csrfToken, errors = null },
    } = res
    const data = await this.notificationService.getNotifications(token)

    data.sort(({ shiftModified: first }, { shiftModified: second }) => moment(second).diff(moment(first)))

    return res.render('pages/notifications', {
      errors,
      data,
      csrfToken,
      moment,
      employeeName,
      authUrl,
    })
  }

  async resume(req: Request, res: Response) {
    const {
      user: { token },
    } = req
    await this.notificationService.resumeNotifications(token)
    res.redirect('back')
  }

  async getManage(req: Request, res: Response) {
    const {
      user: { employeeName, token },
      authUrl,
    } = req

    const {
      locals: { csrfToken, errors = null },
    } = res
    const { snoozeUntil, notificationsEnabled } = await this.getSnoozeAndNotificationSettings(token)

    return res.render('pages/manage-your-notifications', {
      errors,
      csrfToken,
      notificationsEnabled,
      snoozeUntil,
      employeeName,
      authUrl,
    })
  }

  async getPause(req: Request, res: Response) {
    const {
      user: { employeeName, token },
      query: { pauseUnit, pauseValue },
      authUrl,
    } = req

    const {
      locals: { csrfToken, errors },
    } = res

    const { snoozeUntil, notificationsEnabled } = await this.getSnoozeAndNotificationSettings(token)

    return res.render('pages/pause-notifications', {
      errors,
      csrfToken,
      notificationsEnabled,
      snoozeUntil,
      employeeName,
      authUrl,
      pauseUnit,
      pauseValue,
    })
  }

  async setPause(req: Request, res: Response) {
    const errors = validationResult(req)
    res.locals.errors = errors
    const {
      user: { employeeName, token },
      body: { pauseUnit, pauseValue },
      authUrl,
    } = req
    const {
      locals: { csrfToken },
    } = res

    if (!errors.isEmpty()) {
      const { snoozeUntil, notificationsEnabled } = await this.getSnoozeAndNotificationSettings(token)
      return res.render('pages/pause-notifications', {
        errors,
        csrfToken,
        notificationsEnabled,
        snoozeUntil,
        employeeName,
        authUrl,
        pauseUnit,
        pauseValue,
      })
    }
    await this.notificationService.updateSnooze(token, this.getFormattedFutureDate(pauseUnit, pauseValue))
    return res.redirect('/notifications/manage')
  }

  private getFormattedFutureDate(pauseUnit: string, pauseValue: number) {
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
