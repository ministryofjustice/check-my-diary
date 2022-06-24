import { Request, Response } from 'express'
import CalendarController from './calendarController'
import { EMAIL } from '../helpers/constants'

jest.mock('jwt-decode', () => {
  return () => ({ authorities: 'ROLE_MFA' })
})

describe('CalendarController', () => {
  const renderMock = jest.fn()
  const nextMock = jest.fn()
  const token = { replace: 'sausages' }
  const employeeName = 'Ray Parker Jr.'
  const authUrl = ''
  const csrfToken = 'tomato'
  const getCalendarMonthMock = jest.fn()
  const countUnprocessedNotificationsMock = jest.fn()
  const notificationPreferencesMock = jest.fn()
  const getMyMfaSettingsMock = jest.fn()
  const getUserAuthenticationDetailsMock = jest.fn()

  const app = {
    get: () => ({
      calendarService: { getCalendarMonth: getCalendarMonthMock },
      notificationService: {
        countUnprocessedNotifications: countUnprocessedNotificationsMock,
        getPreferences: notificationPreferencesMock,
      },
      signInService: { getMyMfaSettings: getMyMfaSettingsMock },
      userAuthenticationService: { getUserAuthenticationDetails: getUserAuthenticationDetailsMock },
    }),
  }
  const calendarData = [{ date: new Date(), details: [{ displayType: 'DAY_START', start: new Date() }] }]
  const notificationCount = 42
  const preferences = { preference: EMAIL }
  const mfa = { newUser: true, existingUser: false, firstTimeUser: false }
  beforeEach(async () => {
    getCalendarMonthMock.mockResolvedValue(calendarData)
    countUnprocessedNotificationsMock.mockResolvedValue(notificationCount)
    notificationPreferencesMock.mockResolvedValue(preferences)
    getMyMfaSettingsMock.mockResolvedValue(mfa)
    getUserAuthenticationDetailsMock.mockResolvedValue([{ EmailAddress: 's@a.b' }])
    const res = { render: renderMock, locals: { csrfToken } } as unknown as Response
    const req = {
      authUrl,
      user: { token, employeeName },
      body: { pauseUnit: 'days', pauseValue: 3 },
      app,
      params: { date: '2001-01-01' },
    } as unknown as Request
    await new CalendarController().getDate(req, res, nextMock)
  })
  afterEach(() => {
    jest.resetAllMocks()
  })
  describe('with valid data', () => {
    it('should get the notification count', () => {
      expect(countUnprocessedNotificationsMock).toHaveBeenCalledTimes(1)
    })
    it('should get calendar data', () => {
      expect(getCalendarMonthMock).toHaveBeenCalledTimes(1)
    })
    it('should get banner info', () => {
      expect(notificationPreferencesMock).toHaveBeenCalledTimes(1)
      expect(getMyMfaSettingsMock).toHaveBeenCalledTimes(1)
      expect(getUserAuthenticationDetailsMock).toHaveBeenCalledTimes(1)
    })
    it('should not call the next function', () => {
      expect(nextMock).not.toHaveBeenCalled()
    })
    it('should call the render function', () => {
      expect(renderMock).toHaveBeenCalledTimes(1)
    })
  })
})
