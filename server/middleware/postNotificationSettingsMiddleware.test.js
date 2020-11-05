const { validationResult } = require('express-validator')
const { postNotificationSettingsMiddleware } = require('./postNotificationSettingsMiddleware')
const { NONE, EMAIL } = require('../helpers/constants')

jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}))

describe('post notification settings middleware', () => {
  const renderMock = jest.fn()
  const redirectMock = jest.fn()
  const nextMock = jest.fn()
  const token = 'aubergine'
  const csrfToken = 'courgette'
  const authUrl = 'carrot'
  const employeeName = 'fennel'
  const hmppsAuthMFAUser = 'peas'
  const emailText = 'checkmydiary@digital.justice.gov.uk'
  const mobileNumber = '404040404'

  const updatePreferencesMock = jest.fn().mockResolvedValue()
  const app = { get: () => ({ notificationService: { updatePreferences: updatePreferencesMock } }) }
  let req
  let res
  beforeEach(() => {
    res = { render: renderMock, redirect: redirectMock, locals: { csrfToken } }
    req = { user: { token, employeeName }, authUrl, hmppsAuthMFAUser, body: {}, app }
  })
  afterEach(() => {
    jest.resetAllMocks()
  })
  describe('with "email" selected', () => {
    describe('and no validation errors', () => {
      beforeEach(() => {
        req.body = { inputEmail: emailText, inputMobile: mobileNumber, contactMethod: EMAIL }
        validationResult.mockReturnValueOnce({ isEmpty: () => true })
        postNotificationSettingsMiddleware(req, res, nextMock)
      })
      it('should validate the params', () => {
        expect(validationResult).toHaveBeenCalledTimes(1)
      })
      it('should update the preferences by calling the "updatePreferences" method on the "notificationService"', () => {
        expect(updatePreferencesMock).toHaveBeenCalledTimes(1)
        expect(updatePreferencesMock).toHaveBeenCalledWith(token, EMAIL, emailText, '')
      })
      it('should call the redirect function once', () => {
        expect(redirectMock).toHaveBeenCalledTimes(1)
        expect(redirectMock).toHaveBeenCalledWith('/notifications')
      })
      it('should not call the render function', () => {
        expect(renderMock).not.toHaveBeenCalled()
      })
      it('should not call the next function', () => {
        expect(nextMock).not.toHaveBeenCalled()
      })
    })
    describe('and validation errors', () => {
      const errors = 'sausage'
      beforeEach(() => {
        req.body = { inputEmail: emailText, inputMobile: '', contactMethod: EMAIL }
        validationResult.mockReturnValueOnce({ isEmpty: () => false, mapped: () => errors })
        postNotificationSettingsMiddleware(req, res, nextMock)
      })
      it('should validate the params', () => {
        expect(validationResult).toHaveBeenCalledTimes(1)
      })
      it('should not update the preferences', () => {
        expect(updatePreferencesMock).not.toHaveBeenCalled()
      })
      it('should not call the redirect function', () => {
        expect(redirectMock).not.toHaveBeenCalled()
      })
      it('should call the render function', () => {
        expect(renderMock).toHaveBeenCalledTimes(1)
        expect(renderMock).toHaveBeenCalledWith('pages/notification-settings', {
          errors,
          authUrl,
          csrfToken,
          employeeName,
          hmppsAuthMFAUser,
          contactMethod: EMAIL,
          inputEmail: emailText,
          inputMobile: '',
        })

        // expect(renderMock.mock.calls[0][0]).toBe({})
      })
      it('should not call the next function', () => {
        expect(nextMock).not.toHaveBeenCalled()
      })
    })
  })
  describe('with "none" selected', () => {
    beforeEach(() => {
      req.body = { inputEmail: emailText, inputMobile: mobileNumber, contactMethod: NONE }
      validationResult.mockReturnValueOnce({ isEmpty: () => true })
      postNotificationSettingsMiddleware(req, res, nextMock)
    })
    it('should update the preferences', () => {
      expect(updatePreferencesMock).toHaveBeenCalledTimes(1)
      expect(updatePreferencesMock).toHaveBeenCalledWith(token, NONE, '', '')
    })
  })
  describe('with "none" selected', () => {
    beforeEach(() => {
      req.body = { inputEmail: emailText, inputMobile: mobileNumber, contactMethod: NONE }
      validationResult.mockReturnValueOnce({ isEmpty: () => true })
      postNotificationSettingsMiddleware(req, res, nextMock)
    })
    it('should update the preferences', () => {
      expect(updatePreferencesMock).toHaveBeenCalledTimes(1)
      expect(updatePreferencesMock).toHaveBeenCalledWith(token, NONE, '', '')
    })
  })
})
