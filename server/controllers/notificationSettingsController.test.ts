import type { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import NotificationSettingsController from './notificationSettingsController'
import NotificationType from '../helpers/NotificationType'
import { NotificationService } from '../services'

describe('notification settings middleware', () => {
  const renderMock = jest.fn()
  const nextMock = jest.fn()
  const token = 'aubergine'

  const getPreferencesMock = jest.fn()
  const notificationService = { getPreferences: getPreferencesMock } as unknown as NotificationService
  let req: Request
  let res: Response
  beforeEach(() => {
    req = { user: { token }, body: {} } as unknown as Request
    res = { render: renderMock } as unknown as Response
  })
  afterEach(() => {
    jest.resetAllMocks()
  })
  describe('with persisted preferences', () => {
    beforeEach(async () => {
      getPreferencesMock.mockResolvedValue({ preference: NotificationType.SMS, email: '', sms: '404040404' })
      await new NotificationSettingsController(notificationService).getSettings(req, res)
    })
    it('should get the users notification preferences', () => {
      expect(getPreferencesMock).toHaveBeenCalledTimes(1)
      expect(getPreferencesMock).toHaveBeenCalledWith(token)
    })
    it('should render the page with the correct values', () => {
      expect(renderMock).toHaveBeenCalledTimes(1)
      expect(renderMock).toHaveBeenCalledWith('pages/notification-settings.njk', {
        contactMethod: NotificationType.SMS,
        inputEmail: '',
        inputSMS: '404040404',
        errors: validationResult(req),
      })
    })
    it('should not call the next function', () => {
      expect(nextMock).not.toHaveBeenCalled()
    })
  })
  describe('with no persisted preferences', () => {
    beforeEach(async () => {
      getPreferencesMock.mockResolvedValue({})
      await new NotificationSettingsController(notificationService).getSettings(req, res)
    })
    it('should get the users notification preferences', () => {
      expect(getPreferencesMock).toHaveBeenCalledTimes(1)
      expect(getPreferencesMock).toHaveBeenCalledWith(token)
    })
    it('should render the page reflecting no notifications type', () => {
      expect(renderMock).toHaveBeenCalledTimes(1)
      expect(renderMock).toHaveBeenCalledWith('pages/notification-settings.njk', {
        contactMethod: '',
        inputEmail: '',
        inputSMS: '',
        errors: validationResult(req),
      })
    })
    it('should not call the next function', () => {
      expect(nextMock).not.toHaveBeenCalled()
    })
  })
})
