import { Request, Response } from 'express'
import CalendarController from './calendarController'
import { EMAIL, SMS } from '../helpers/constants'
import mfaBannerType from '../helpers/mfaBannerType'
import {
  CalendarService,
  NotificationCookieService,
  NotificationService,
  UserAuthenticationService,
  UserService,
} from '../services'

const { EXISTING_USER, NEW_USER, FIRST_TIME_USER } = mfaBannerType

const rolesMock = jest.fn()
jest.mock('jwt-decode', () => {
  return () => rolesMock()
})

const calendarData = [{ date: new Date(), details: [{ displayType: 'DAY_START', start: new Date() }] }]
const notificationCount = 42
const getCalendarMonthMock = jest.fn()
const countUnprocessedNotificationsMock = jest.fn()
const renderMock = jest.fn()
const nextMock = jest.fn()
const token = { replace: 'sausages' }
const employeeName = 'Ray Parker Jr.'
const authUrl = ''
const csrfToken = 'tomato'
const notificationPreferencesMock = jest.fn()
const getUserMfaMock = jest.fn()
const getUserAuthenticationDetailsMock = jest.fn()
const res = { render: renderMock, locals: { csrfToken } } as unknown as Response
const req = {
  authUrl,
  user: { token, employeeName },
  params: { date: '2001-01-01' },
} as unknown as Request
const calendarService: CalendarService = { getCalendarMonth: getCalendarMonthMock } as unknown as CalendarService
const notificationService = {
  countUnprocessedNotifications: countUnprocessedNotificationsMock,
  getPreferences: notificationPreferencesMock,
} as unknown as NotificationService
const notificationCookieService = new NotificationCookieService()
const userAuthenticationService = {
  getUserAuthenticationDetails: getUserAuthenticationDetailsMock,
} as unknown as UserAuthenticationService
const userService: UserService = { getUserMfa: getUserMfaMock } as unknown as UserService
const calendarController = () =>
  new CalendarController(
    calendarService,
    notificationService,
    notificationCookieService,
    userAuthenticationService,
    userService,
  )

beforeEach(() => {
  rolesMock.mockReturnValue({ authorities: ['ROLE_MFA'] })
  getCalendarMonthMock.mockResolvedValue(calendarData)
  countUnprocessedNotificationsMock.mockResolvedValue(notificationCount)
})
afterEach(() => {
  jest.resetAllMocks()
})
describe('CalendarController', () => {
  describe('with valid data', () => {
    beforeEach(async () => {
      notificationPreferencesMock.mockResolvedValue({ preference: EMAIL })
      getUserMfaMock.mockResolvedValue({ backupVerified: false, emailVerified: true })
      getUserAuthenticationDetailsMock.mockResolvedValue([{ EmailAddress: 's@a.b' }])

      await calendarController().getDate(req, res)
    })
    it('should get the notification count', () => {
      expect(countUnprocessedNotificationsMock).toHaveBeenCalledTimes(1)
    })
    it('should get calendar data', () => {
      expect(getCalendarMonthMock).toHaveBeenCalledTimes(1)
    })
    it('should get banner info', () => {
      expect(notificationPreferencesMock).toHaveBeenCalledTimes(1)
      expect(getUserMfaMock).toHaveBeenCalledTimes(1)
      expect(getUserAuthenticationDetailsMock).toHaveBeenCalledTimes(1)
    })
    it('should not call the next function', () => {
      expect(nextMock).not.toHaveBeenCalled()
    })
    it('should call the render function', () => {
      expect(renderMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('with banners', () => {
    it('should show the SMS banner, overriding the EXISTING_USER banner', async () => {
      notificationPreferencesMock.mockResolvedValue({ preference: SMS })
      getUserMfaMock.mockResolvedValue({ backupVerified: false, mobileVerified: false })
      getUserAuthenticationDetailsMock.mockResolvedValue([{ EmailAddress: 's@a.b' }])

      await calendarController().getDate(req, res)
      expect(renderMock.mock.calls[0][0]).toEqual('pages/calendar')
      expect(renderMock.mock.calls[0][1].showBanner).toEqual({
        notifications: true,
        mfa: '',
      })
    })
    it('should show the SMS banner, overriding the NEW_USER banner', async () => {
      notificationPreferencesMock.mockResolvedValue({ preference: SMS })
      getUserMfaMock.mockResolvedValue({ backupVerified: false, mobileVerified: true })
      getUserAuthenticationDetailsMock.mockResolvedValue([])

      await calendarController().getDate(req, res)
      expect(renderMock.mock.calls[0][0]).toEqual('pages/calendar')
      expect(renderMock.mock.calls[0][1].showBanner).toEqual({
        notifications: true,
        mfa: '',
      })
    })
    it('should show the EXISTING_USER banner', async () => {
      notificationPreferencesMock.mockResolvedValue({ preference: EMAIL })
      getUserMfaMock.mockResolvedValue({ backupVerified: false, mobileVerified: false })
      getUserAuthenticationDetailsMock.mockResolvedValue([{ EmailAddress: 's@a.b' }])

      await calendarController().getDate(req, res)
      expect(renderMock.mock.calls[0][0]).toEqual('pages/calendar')
      expect(renderMock.mock.calls[0][1].showBanner).toEqual({
        notifications: false,
        mfa: EXISTING_USER,
      })
    })
    it('should show the NEW_USER banner', async () => {
      notificationPreferencesMock.mockResolvedValue({ preference: EMAIL })
      getUserMfaMock.mockResolvedValue({ backupVerified: true, mobileVerified: false })
      getUserAuthenticationDetailsMock.mockResolvedValue([])

      await calendarController().getDate(req, res)
      expect(renderMock.mock.calls[0][0]).toEqual('pages/calendar')
      expect(renderMock.mock.calls[0][1].showBanner).toEqual({
        notifications: false,
        mfa: NEW_USER,
      })
    })
    it('should show the FIRST_TIME_USER banner', async () => {
      notificationPreferencesMock.mockResolvedValue({ preference: EMAIL })
      getUserMfaMock.mockResolvedValue({ backupVerified: false, mobileVerified: false })
      getUserAuthenticationDetailsMock.mockResolvedValue([])

      await calendarController().getDate(req, res)
      expect(renderMock.mock.calls[0][0]).toEqual('pages/calendar')
      expect(renderMock.mock.calls[0][1].showBanner).toEqual({
        notifications: false,
        mfa: FIRST_TIME_USER,
      })
    })
    it('should show nothing for users without the role', async () => {
      rolesMock.mockReturnValue({ authorities: ['ROLE_OTHER'] })
      notificationPreferencesMock.mockResolvedValue({ preference: EMAIL })
      getUserMfaMock.mockResolvedValue({ backupVerified: false, mobileVerified: false })
      getUserAuthenticationDetailsMock.mockResolvedValue([])

      await calendarController().getDate(req, res)
      expect(renderMock.mock.calls[0][0]).toEqual('pages/calendar')
      expect(renderMock.mock.calls[0][1].showBanner).toEqual({
        notifications: false,
        mfa: '',
      })
    })
    it('should show nothing when EXISTING_USER dismissed', async () => {
      req.cookies = {}
      req.cookies['ui-notification-banner-EXISTING_USER'] = 'dismissed'
      notificationPreferencesMock.mockResolvedValue({ preference: EMAIL })
      getUserMfaMock.mockResolvedValue({ backupVerified: false, mobileVerified: false })
      getUserAuthenticationDetailsMock.mockResolvedValue([{ EmailAddress: 's@a.b' }])

      await calendarController().getDate(req, res)
      expect(renderMock.mock.calls[0][0]).toEqual('pages/calendar')
      expect(renderMock.mock.calls[0][1].showBanner).toEqual({
        notifications: false,
        mfa: '',
      })
    })
    it('should show nothing when NEW_USER dismissed', async () => {
      req.cookies = {}
      req.cookies['ui-notification-banner-NEW_USER'] = 'dismissed'
      notificationPreferencesMock.mockResolvedValue({ preference: EMAIL })
      getUserMfaMock.mockResolvedValue({ backupVerified: false, mobileVerified: true })
      getUserAuthenticationDetailsMock.mockResolvedValue([])

      await calendarController().getDate(req, res)
      expect(renderMock.mock.calls[0][0]).toEqual('pages/calendar')
      expect(renderMock.mock.calls[0][1].showBanner).toEqual({
        notifications: false,
        mfa: '',
      })
    })
  })
})
