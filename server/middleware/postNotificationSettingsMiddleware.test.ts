import type { Request, Response } from 'express'
import { validationResult } from 'express-validator'

import { postNotificationSettingsMiddleware } from './postNotificationSettingsMiddleware'

import { EMAIL, NONE } from '../helpers/constants'

jest.mock('express-validator')
const validationResultMock = validationResult as unknown as jest.Mock

describe('post notification settings middleware', () => {
  const renderMock = jest.fn()
  const redirectMock = jest.fn()
  const nextMock = jest.fn()
  const token = 'aubergine'
  const csrfToken = 'courgette'
  const authUrl = 'carrot'
  const employeeName = 'fennel'
  const emailText = 'checkmydiary@digital.justice.gov.uk'
  const mobileNumber = '404040404'

  const updatePreferencesMock = jest.fn()
  const app = { get: () => ({ notificationService: { updatePreferences: updatePreferencesMock } }) }
  let req: Request
  let res: Response
  beforeEach(() => {
    req = { user: { token, employeeName }, authUrl, body: {}, app } as unknown as Request
    res = { render: renderMock, redirect: redirectMock, locals: { csrfToken } } as unknown as Response
  })
  afterEach(() => {
    jest.resetAllMocks()
  })
  describe('with "email" selected', () => {
    describe('and no validation errors', () => {
      beforeEach(async () => {
        req.body = { inputEmail: emailText, notificationRequired: 'Yes' }
        validationResultMock.mockReturnValueOnce({ isEmpty: () => true })
        await postNotificationSettingsMiddleware(req, res, nextMock)
      })
      it('should validate the params', () => {
        expect(validationResultMock).toHaveBeenCalledTimes(1)
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
      const errors = { isEmpty: () => false, mapped: () => 'sausage' }
      beforeEach(async () => {
        req.body = { inputEmail: emailText, notificationRequired: 'Yes' }
        validationResultMock.mockReturnValueOnce(errors)
        await postNotificationSettingsMiddleware(req, res, nextMock)
      })
      it('should validate the params', () => {
        expect(validationResultMock).toHaveBeenCalledTimes(1)
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
          contactMethod: EMAIL,
          inputEmail: emailText,
        })

        // expect(renderMock.mock.calls[0][0]).toBe({})
      })
      it('should not call the next function', () => {
        expect(nextMock).not.toHaveBeenCalled()
      })
    })
  })
  describe('with "none" selected', () => {
    beforeEach(async () => {
      req.body = { inputEmail: emailText, notificationRequired: 'No' }
      validationResultMock.mockReturnValueOnce({ isEmpty: () => true })
      await postNotificationSettingsMiddleware(req, res, nextMock)
    })
    it('should update the preferences', () => {
      expect(updatePreferencesMock).toHaveBeenCalledTimes(1)
      expect(updatePreferencesMock).toHaveBeenCalledWith(token, NONE, '', '')
    })
  })
  describe('with "none" selected', () => {
    beforeEach(async () => {
      req.body = { inputEmail: emailText, notificationRequired: 'No' }
      validationResultMock.mockReturnValueOnce({ isEmpty: () => true })
      await postNotificationSettingsMiddleware(req, res, nextMock)
    })
    it('should update the preferences', () => {
      expect(updatePreferencesMock).toHaveBeenCalledTimes(1)
      expect(updatePreferencesMock).toHaveBeenCalledWith(token, NONE, '', '')
    })
  })
})
