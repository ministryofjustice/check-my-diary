import type { Request, Response } from 'express'
import NotificationSettingsController from './notificationSettingsController'
import { SMS } from '../helpers/constants'

describe('notification settings middleware', () => {
  const renderMock = jest.fn()
  const nextMock = jest.fn()
  const token = 'aubergine'
  const csrfToken = 'courgette'
  const authUrl = 'carrot'
  const employeeName = 'fennel'

  const getPreferencesMock = jest.fn()
  const app = { get: () => ({ notificationService: { getPreferences: getPreferencesMock } }) }
  let req: Request
  let res: Response
  beforeEach(() => {
    req = { user: { token, employeeName }, authUrl, body: {}, app } as unknown as Request
    res = { render: renderMock, locals: { csrfToken } } as unknown as Response
  })
  afterEach(() => {
    jest.resetAllMocks()
  })
  describe('with persisted preferences', () => {
    beforeEach(async () => {
      getPreferencesMock.mockResolvedValue({ preference: SMS, email: '', sms: '404040404' })
      await new NotificationSettingsController().getSettings(req, res, nextMock)
    })
    it('should get the users notification preferences', () => {
      expect(getPreferencesMock).toHaveBeenCalledTimes(1)
      expect(getPreferencesMock).toHaveBeenCalledWith(token)
    })
    it('should render the page with the correct values', () => {
      expect(renderMock).toHaveBeenCalledTimes(1)
      expect(renderMock).toHaveBeenCalledWith('pages/notification-settings', {
        authUrl,
        csrfToken,
        employeeName,
        contactMethod: SMS,
        inputEmail: '',
        errors: null,
      })
    })
    it('should not call the next function', () => {
      expect(nextMock).not.toHaveBeenCalled()
    })
  })
  describe('with no persisted preferences', () => {
    beforeEach(async () => {
      getPreferencesMock.mockResolvedValue({})
      await new NotificationSettingsController().getSettings(req, res, nextMock)
    })
    it('should get the users notification preferences', () => {
      expect(getPreferencesMock).toHaveBeenCalledTimes(1)
      expect(getPreferencesMock).toHaveBeenCalledWith(token)
    })
    it('should render the page reflecting no notifications type', () => {
      expect(renderMock).toHaveBeenCalledTimes(1)
      expect(renderMock).toHaveBeenCalledWith('pages/notification-settings', {
        authUrl,
        csrfToken,
        employeeName,
        contactMethod: '',
        inputEmail: '',
        errors: null,
      })
    })
    it('should not call the next function', () => {
      expect(nextMock).not.toHaveBeenCalled()
    })
  })
})
