import type { Request, Response } from 'express'
import moment from 'moment'
import notificationMiddleware from './notificationMiddleware'
import { NONE, SMS } from '../helpers/constants'
import type { Notification } from '../services/notifications.types'

import utilities from '../helpers/utilities'

jest.mock('../helpers/utilities')
const getSnoozeUntil = utilities.getSnoozeUntil as jest.Mock

describe('notification middleware', () => {
  const renderMock = jest.fn()
  const nextMock = jest.fn()
  const token = 'aubergine'
  const csrfToken = 'courgette'
  const authUrl = 'carrot'
  const employeeName = 'fennel'
  const notification1 = { shiftModified: '2020-08-24' }
  const notification2 = { shiftModified: '2020-08-26' }
  let notificationData: Notification[]

  const getPreferencesMock = jest.fn()
  const getNotificationsMock = jest.fn()
  const app = {
    get: () => ({
      notificationService: { getPreferences: getPreferencesMock, getNotifications: getNotificationsMock },
    }),
  }
  let req: Request
  let res: Response
  const errors = null
  beforeEach(() => {
    getSnoozeUntil.mockReturnValue('')
    notificationData = [notification1, notification2]
    getNotificationsMock.mockResolvedValue(notificationData)
    req = { user: { token, employeeName }, authUrl, body: {}, app } as unknown as Request
    res = { render: renderMock, locals: { csrfToken } } as unknown as Response
  })
  afterEach(() => {
    jest.resetAllMocks()
  })
  describe('with notifications enabled', () => {
    describe('with no snooze', () => {
      beforeEach(async () => {
        getPreferencesMock.mockResolvedValue({ snoozeUntil: '', preference: SMS })
        await notificationMiddleware(req, res, nextMock)
      })
      it('should get the users notification preferences', () => {
        expect(getPreferencesMock).toHaveBeenCalledTimes(1)
        expect(getPreferencesMock).toHaveBeenCalledWith(token)
      })
      it('should get the users notifications', () => {
        expect(getNotificationsMock).toHaveBeenCalledTimes(1)
        expect(getNotificationsMock).toHaveBeenCalledWith(token)
      })
      it('should sort the users notifications', () => {
        expect(notificationData).toEqual([notification2, notification1])
      })
      it('should render the page with the correct values', () => {
        expect(renderMock).toHaveBeenCalledTimes(1)
        expect(renderMock).toHaveBeenCalledWith('pages/notifications', {
          errors,
          data: notificationData,
          csrfToken,
          notificationsEnabled: true,
          snoozeUntil: '',
          moment,
          employeeName,
          authUrl,
        })
      })
      it('should not call the next function', () => {
        expect(nextMock).not.toHaveBeenCalled()
      })
      it('should try to generate a snooze until string', () => {
        expect(getSnoozeUntil).toHaveBeenCalledTimes(1)
      })
    })
    describe('with a snooze', () => {
      const snoozeUntil = 'Friday, 28th August 2020'
      beforeEach(async () => {
        getPreferencesMock.mockResolvedValue({ preference: SMS, snoozeUntil: '2020-08-27' })
        getSnoozeUntil.mockReturnValue(snoozeUntil)
        await notificationMiddleware(req, res, nextMock)
      })

      it('should generate a snooze until string', () => {
        expect(getSnoozeUntil).toHaveBeenCalledTimes(1)
      })
      it('should render the page with the correct values', () => {
        expect(renderMock).toHaveBeenCalledTimes(1)
        expect(renderMock).toHaveBeenCalledWith('pages/notifications', {
          errors,
          data: notificationData,
          csrfToken,
          notificationsEnabled: true,
          snoozeUntil,
          moment,
          employeeName,
          authUrl,
        })
      })
    })
  })
  describe('with notifications disabled', () => {
    beforeEach(async () => {
      getPreferencesMock.mockResolvedValue({ preference: NONE })
      await notificationMiddleware(req, res, nextMock)
    })
    it('should get the users notification preferences', () => {
      expect(getPreferencesMock).toHaveBeenCalledTimes(1)
      expect(getPreferencesMock).toHaveBeenCalledWith(token)
    })
    it('should not generate a snooze until string', () => {
      expect(getSnoozeUntil).not.toHaveBeenCalled()
    })
    it('should render the page reflecting a "none" notifications type', () => {
      expect(renderMock).toHaveBeenCalledTimes(1)
      expect(renderMock).toHaveBeenCalledWith('pages/notifications', {
        errors,
        data: notificationData,
        csrfToken,
        notificationsEnabled: false,
        snoozeUntil: '',
        moment,
        employeeName,
        authUrl,
      })
    })
    it('should not call the next function', () => {
      expect(nextMock).not.toHaveBeenCalled()
    })
  })
})
