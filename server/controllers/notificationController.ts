import { Application, NextFunction, Request, Response } from 'express'
import moment from 'moment'
import { validationResult } from 'express-validator'
import { add, formatISO } from 'date-fns'
import { Notification } from '../services/notifications.types'
import logger from '../../log'
import { NONE } from '../helpers/constants'
import { getSnoozeUntil } from '../helpers/utilities'

function serviceUnavailable(req: Request, res: Response) {
  logger.error('Service unavailable')
  res.render('pages/index', {
    authError: false,
    csrfToken: res.locals.csrfToken,
  })
}

function getFormattedFutureDate(pauseUnit: string, pauseValue: number) {
  const duration = { [pauseUnit]: pauseValue }
  return formatISO(add(new Date(), duration), { representation: 'date' })
}

async function getSnoozeAndNotificationSettings(app: Application, token: string) {
  const { notificationService } = app.get('DataServices')
  const { snoozeUntil: rawSnoozeUntil, preference = NONE } = await notificationService.getPreferences(token)
  const notificationsEnabled = preference !== NONE
  const snoozeUntil = notificationsEnabled ? getSnoozeUntil(rawSnoozeUntil) : ''
  return { snoozeUntil, notificationsEnabled }
}

export default class NotificationController {
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        user: { employeeName, token },
        app,
        authUrl,
      } = req

      const {
        locals: { csrfToken, errors = null },
      } = res
      const { notificationService } = app.get('DataServices')
      const data = (await notificationService.getNotifications(token)) as Notification[]

      data.sort(({ shiftModified: first }, { shiftModified: second }) => moment(second).diff(moment(first)))

      return res.render('pages/notifications', {
        errors,
        data,
        csrfToken,
        moment,
        employeeName,
        authUrl,
      })
    } catch (error) {
      return next(error)
    }
  }

  async resume(req: Request, res: Response) {
    try {
      const {
        user: { token },
        app,
      } = req
      const {
        notificationService: { resumeNotifications },
      } = app.get('DataServices')
      await resumeNotifications(token)
      res.redirect('back')
    } catch (error) {
      serviceUnavailable(req, res)
    }
  }

  async getManage(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        user: { employeeName, token },
        app,
        authUrl,
      } = req

      const {
        locals: { csrfToken, errors = null },
      } = res
      const { snoozeUntil, notificationsEnabled } = await getSnoozeAndNotificationSettings(app, token)

      return res.render('pages/manage-your-notifications', {
        errors,
        csrfToken,
        notificationsEnabled,
        snoozeUntil,
        employeeName,
        authUrl,
      })
    } catch (error) {
      return next(error)
    }
  }

  async getPause(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        user: { employeeName, token },
        query: { pauseUnit, pauseValue },
        app,
        authUrl,
      } = req

      const {
        locals: { csrfToken, errors },
      } = res

      const { snoozeUntil, notificationsEnabled } = await getSnoozeAndNotificationSettings(app, token)

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
    } catch (error) {
      return next(error)
    }
  }

  async setPause(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req)
      res.locals.errors = errors
      const {
        user: { employeeName, token },
        app,
        body: { pauseUnit, pauseValue },
        authUrl,
      } = req
      const {
        locals: { csrfToken },
      } = res

      if (!errors.isEmpty()) {
        const { snoozeUntil, notificationsEnabled } = await getSnoozeAndNotificationSettings(app, token)
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
      const {
        notificationService: { updateSnooze },
      } = app.get('DataServices')
      await updateSnooze(token, getFormattedFutureDate(pauseUnit, pauseValue))
      return res.redirect('/notifications/manage')
    } catch (error) {
      const message = 'Pause notifications failed. Please try again.'
      logger.error(error, message)
      res.locals.error = [message]
      return next()
    }
  }
}
