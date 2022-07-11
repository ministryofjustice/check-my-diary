import type { Request, Response } from 'express'
import type { Notification } from '../services/notifications.types'

import utilities from '../helpers/utilities'
import NotificationController from './notificationController'
import { NotificationService } from '../services'

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

  const getNotificationsMock = jest.fn()
  const notificationService = { getNotifications: getNotificationsMock } as unknown as NotificationService
  let req: Request
  let res: Response
  const errors = null
  beforeEach(() => {
    getSnoozeUntil.mockReturnValue('')
    notificationData = [notification1, notification2]
    getNotificationsMock.mockResolvedValue(notificationData)
    req = { user: { token, employeeName }, authUrl, body: {} } as unknown as Request
    res = { render: renderMock, locals: { csrfToken } } as unknown as Response
  })
  afterEach(() => {
    jest.resetAllMocks()
  })
  beforeEach(async () => {
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
    expect(renderMock).toHaveBeenCalledWith('pages/notifications.njk', {
      errors,
      data: notificationData,
    })
  })
  it('should not call the next function', () => {
    expect(nextMock).not.toHaveBeenCalled()
  })
})
