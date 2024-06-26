import { Request, Response } from 'express'
import CalendarController from './calendarController'
import mfaBannerType from '../helpers/mfaBannerType'
import UserService from '../services/userService'
import CalendarService from '../services/calendarService'
import NotificationCookieService from '../services/notificationCookieService'

const { FIRST_TIME_USER } = mfaBannerType

const rolesMock = jest.fn()
jest.mock('jwt-decode', () => ({ jwtDecode: () => rolesMock() }))

const calendarData = [
  {
    date: '2022-07-29',
    details: [
      {
        activity: 'Duty Manager',
        displayType: 'DAY_START',
        displayTypeTime: '2022-07-29T12:30:00',
        start: '2022-07-29T12:30:00',
      },
    ],
  },
]
const getCalendarMonthMock = jest.fn()
const renderMock = jest.fn()
const nextMock = jest.fn()
const token = { replace: 'sausages' }
const employeeName = 'Ray Parker Jr.'
const authUrl = ''
const csrfToken = 'tomato'
const getUserMfaMock = jest.fn()
const res = { render: renderMock, locals: { csrfToken } } as unknown as Response
const req = {
  authUrl,
  user: { token, employeeName },
  params: { date: '2001-01-01' },
  session: {},
  query: {},
} as unknown as Request
const calendarService: CalendarService = { getCalendarMonth: getCalendarMonthMock } as unknown as CalendarService
const notificationCookieService = new NotificationCookieService()
const userService: UserService = { getUserMfa: getUserMfaMock } as unknown as UserService
const calendarController = () => new CalendarController(calendarService, notificationCookieService, userService)

beforeEach(() => {
  rolesMock.mockReturnValue({ authorities: ['ROLE_MFA'] })
  getCalendarMonthMock.mockResolvedValue(calendarData)
})
afterEach(() => {
  jest.resetAllMocks()
})
describe('CalendarController', () => {
  describe('with valid data', () => {
    beforeEach(async () => {
      getUserMfaMock.mockResolvedValue({ backupVerified: false, emailVerified: true })

      await calendarController().getDate(req, res)
    })
    it('should get calendar data', () => {
      expect(getCalendarMonthMock).toHaveBeenCalledTimes(1)
    })
    it('should get banner info', () => {
      expect(getUserMfaMock).toHaveBeenCalledTimes(1)
    })
    it('should not call the next function', () => {
      expect(nextMock).not.toHaveBeenCalled()
    })
    it('should call the render function', () => {
      expect(renderMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('with banners', () => {
    it('should show the SMS banner and the NEW_USER banner', async () => {
      getUserMfaMock.mockResolvedValue({ backupVerified: false, mobileVerified: true })

      await calendarController().getDate(req, res)

      expect(getUserMfaMock).toHaveBeenCalledWith(token)
      expect(renderMock.mock.calls[0][0]).toEqual('pages/calendar.njk')
      expect(renderMock.mock.calls[0][1].showBanner).toEqual({
        notifications: true,
        mfa: 'NEW_USER',
      })
    })
    it('should show the FIRST_TIME_USER banner', async () => {
      getUserMfaMock.mockResolvedValue({ backupVerified: false, mobileVerified: false })

      await calendarController().getDate(req, res)
      expect(renderMock.mock.calls[0][1].showBanner).toEqual({
        notifications: true,
        mfa: FIRST_TIME_USER,
      })
    })
    it('should show banner for non-existing users without the role', async () => {
      rolesMock.mockReturnValue({ authorities: ['ROLE_OTHER'] })
      getUserMfaMock.mockResolvedValue({ backupVerified: false, mobileVerified: false })

      await calendarController().getDate(req, res)
      expect(renderMock.mock.calls[0][1].showBanner).toEqual({
        notifications: true,
        mfa: FIRST_TIME_USER,
      })
    })
    it('should not show banner when NEW_USER dismissed', async () => {
      req.cookies = { 'ui-notification-banner-NEW_USER': 'dismissed' }
      getUserMfaMock.mockResolvedValue({ backupVerified: false, mobileVerified: true })

      await calendarController().getDate(req, res)
      expect(renderMock.mock.calls[0][1].showBanner).toEqual({
        notifications: true,
        mfa: '',
      })
    })
    it('should not show banner when EXISTING_USER dismissed', async () => {
      req.cookies = { 'ui-notification-banner-EXISTING_USER': 'dismissed' }
      getUserMfaMock.mockResolvedValue({ backupVerified: false, mobileVerified: true })

      await calendarController().getDate(req, res)
      expect(renderMock.mock.calls[0][1].showBanner).toEqual({
        notifications: true,
        mfa: '',
      })
    })
    it('should not show banner when SMS banner dismissed', async () => {
      req.cookies = { 'ui-notification-banner-SMS_BANNER': 'dismissed' }
      getUserMfaMock.mockResolvedValue({ backupVerified: false, mobileVerified: true })

      await calendarController().getDate(req, res)
      expect(renderMock.mock.calls[0][1].showBanner).toEqual({
        notifications: false,
        mfa: 'NEW_USER',
      })
    })
  })
})
