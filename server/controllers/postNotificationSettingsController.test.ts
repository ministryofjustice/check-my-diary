import type { Request, Response } from 'express'
import { validationResult } from 'express-validator'

import PostNotificationSettingsController from './postNotificationSettingsController'

import NotificationType from '../helpers/NotificationType'
import { NotificationService } from '../services'

jest.mock('express-validator')
const validationResultMock = validationResult as unknown as jest.Mock

describe('post notification settings middleware', () => {
  const renderMock = jest.fn()
  const redirectMock = jest.fn()
  const token = 'aubergine'
  const emailText = 'checkmydiary@digital.justice.gov.uk'

  const updatePreferencesMock = jest.fn()
  const notificationService = { updatePreferences: updatePreferencesMock } as unknown as NotificationService
  let req: Request
  let res: Response
  beforeEach(() => {
    req = { user: { token }, body: {} } as unknown as Request
    res = { render: renderMock, redirect: redirectMock } as unknown as Response
  })
  afterEach(() => {
    jest.resetAllMocks()
  })
  describe('with "email" selected', () => {
    describe('and no validation errors', () => {
      beforeEach(async () => {
        req.body = { inputEmail: emailText, inputSMS: '', contactMethod: 'EMAIL' }
        validationResultMock.mockReturnValueOnce({ isEmpty: () => true })
        await new PostNotificationSettingsController(notificationService).setSettings(req, res)
      })
      it('should validate the params', () => {
        expect(validationResultMock).toHaveBeenCalledTimes(1)
      })
      it('should update the preferences by calling the "updatePreferences" method on the "notificationService"', () => {
        expect(updatePreferencesMock).toHaveBeenCalledTimes(1)
        expect(updatePreferencesMock).toHaveBeenCalledWith(token, NotificationType.EMAIL, emailText, '')
      })
      it('should call the redirect function once', () => {
        expect(redirectMock).toHaveBeenCalledTimes(1)
        expect(redirectMock).toHaveBeenCalledWith('/notifications/manage')
      })
      it('should not call the render function', () => {
        expect(renderMock).not.toHaveBeenCalled()
      })
    })
    describe('and validation errors', () => {
      const errors = { isEmpty: () => false }
      beforeEach(async () => {
        req.body = { inputEmail: emailText, contactMethod: 'EMAIL' }
        validationResultMock.mockReturnValueOnce(errors)
        await new PostNotificationSettingsController(notificationService).setSettings(req, res)
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
        expect(renderMock).toHaveBeenCalledWith('pages/notification-settings.njk', {
          errors,
          contactMethod: NotificationType.EMAIL,
          inputEmail: emailText,
          inputSMS: '',
        })
      })
    })
  })
  describe('with "none" selected', () => {
    beforeEach(async () => {
      req.body = { inputEmail: emailText, contactMethod: 'NONE' }
      validationResultMock.mockReturnValueOnce({ isEmpty: () => true })
      await new PostNotificationSettingsController(notificationService).setSettings(req, res)
    })
    it('should update the preferences', () => {
      expect(updatePreferencesMock).toHaveBeenCalledTimes(1)
      expect(updatePreferencesMock).toHaveBeenCalledWith(token, NotificationType.NONE, '', '')
    })
  })
})
