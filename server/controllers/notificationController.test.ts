import type { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import type { Notification } from '../services/notifications.types'

import NotificationController from './notificationController'
import NotificationService from '../services/notificationService'

jest.mock('express-validator')
const validationResultMock = validationResult as unknown as jest.Mock

describe('notification controller', () => {
  const renderMock = jest.fn()
  const redirectMock = jest.fn()
  const nextMock = jest.fn()
  const token = 'aubergine'

  const req: Request = { user: { token }, body: {} } as unknown as Request
  const res: Response = { render: renderMock, redirect: redirectMock } as unknown as Response

  const getNotificationsMock = jest.fn()
  const updateSnoozeMock = jest.fn()
  const preferencesMock = jest.fn()
  const notificationService = {
    getNotifications: getNotificationsMock,
    updateSnooze: updateSnoozeMock,
    getPreferences: preferencesMock,
  } as unknown as NotificationService

  afterEach(() => jest.resetAllMocks())

  describe('getNotifications', () => {
    const notification1 = { shiftModified: '2020-08-24' }
    const notification2 = { shiftModified: '2020-08-26' }
    let notificationData: Notification[]

    beforeEach(async () => {
      notificationData = [notification1, notification2]
      getNotificationsMock.mockResolvedValue(notificationData)
      await new NotificationController(notificationService).getNotifications(req, res)
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
      expect(renderMock).toHaveBeenCalledWith('pages/notifications.njk', { data: notificationData })
    })
    it('should not call the next function', () => {
      expect(nextMock).not.toHaveBeenCalled()
    })
  })
  describe('setPause', () => {
    beforeEach(async () => {
      validationResultMock.mockReturnValue({ isEmpty: () => true })
      preferencesMock.mockResolvedValue({})
    })
    it('should do nothing if no user in request', async () => {
      const pauseReq: Request = { body: {} } as unknown as Request

      const response = await new NotificationController(notificationService).setPause(pauseReq, res)

      expect(response).toBeFalsy()
      expect(updateSnoozeMock).not.toHaveBeenCalled()
    })
    it('should render pause notifications if errors on request body', async () => {
      const pauseReq: Request = { user: {}, body: {} } as unknown as Request
      validationResultMock.mockReturnValue({ isEmpty: () => false })

      await new NotificationController(notificationService).setPause(pauseReq, res)

      expect(validationResultMock).toHaveBeenCalledTimes(1)
      expect(renderMock).toHaveBeenCalledTimes(1)
      expect(renderMock).toHaveBeenCalledWith('pages/pause-notifications.njk', expect.anything())
      expect(updateSnoozeMock).not.toHaveBeenCalled()
    })
    it('should update the snooze notification', async () => {
      const pauseReq: Request = { user: { token }, body: { pauseUnit: 'days', pauseValue: '10' } } as unknown as Request

      await new NotificationController(notificationService).setPause(pauseReq, res)

      const expected = new Date()
      expected.setDate(expected.getDate() + 10)
      expect(updateSnoozeMock).toHaveBeenCalledWith(token, expected.toISOString().split('T')[0])
      expect(redirectMock).toHaveBeenCalledWith('/notifications/manage')
    })
  })
})
