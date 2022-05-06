import type { Response } from 'express'
import notificationSettingsMiddleware from './notificationSettingsMiddleware'
import { NONE, SMS } from '../helpers/constants'
import { AppRequest } from '../helpers/utilities.types'

describe('notification settings middleware', () => {
  const renderMock = jest.fn()
  const nextMock = jest.fn()
  const token = 'aubergine'
  const csrfToken = 'courgette'
  const authUrl = 'carrot'
  const employeeName = 'fennel'
  const mobileNumber = '404040404'

  const getPreferencesMock = jest.fn()
  const app = { get: () => ({ notificationService: { getPreferences: getPreferencesMock } }) }
  let req: AppRequest
  let res: Response
  beforeEach(() => {
    req = { user: { token, employeeName }, authUrl, body: {}, app } as unknown as AppRequest
    res = { render: renderMock, locals: { csrfToken } } as unknown as Response
  })
  afterEach(() => {
    jest.resetAllMocks()
  })
  describe('with persisted preferences', () => {
    beforeEach(() => {
      getPreferencesMock.mockResolvedValue({ preference: SMS, email: '', sms: '404040404' })
      notificationSettingsMiddleware(req, res, nextMock)
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
        inputMobile: mobileNumber,
        errors: null,
      })
    })
    it('should not call the next function', () => {
      expect(nextMock).not.toHaveBeenCalled()
    })
  })
  describe('with no persisted preferences', () => {
    beforeEach(() => {
      getPreferencesMock.mockResolvedValue({})
      notificationSettingsMiddleware(req, res, nextMock)
    })
    it('should get the users notification preferences', () => {
      expect(getPreferencesMock).toHaveBeenCalledTimes(1)
      expect(getPreferencesMock).toHaveBeenCalledWith(token)
    })
    it('should render the page reflecting a "none" notifications type', () => {
      expect(renderMock).toHaveBeenCalledTimes(1)
      expect(renderMock).toHaveBeenCalledWith('pages/notification-settings', {
        authUrl,
        csrfToken,
        employeeName,
        contactMethod: NONE,
        inputEmail: '',
        inputMobile: '',
        errors: null,
      })
    })
    it('should not call the next function', () => {
      expect(nextMock).not.toHaveBeenCalled()
    })
  })
})
