import calendarMiddleware from './calendarMiddleware'
import utilities from '../helpers/utilities'
import { EMAIL } from '../helpers/constants'

jest.mock('../helpers/utilities', () => ({
  configureCalendar: jest.fn(),
  processDay: jest.fn(() => true),
  appendUserErrorMessage: jest.fn((error) => error),
}))

const configureCalendar = utilities.configureCalendar as jest.Mock

describe('calendar middleware', () => {
  const renderMock = jest.fn()
  const nextMock = jest.fn()
  const token = 'sausages'
  const employeeName = 'Ray Parker Jr.'
  const authUrl = ''
  const csrfToken = 'tomato'
  const getCalendarMonthMock = jest.fn()
  const countUnprocessedNotificationsMock = jest.fn()
  const notificationPreferencesMock = jest.fn()
  const app = {
    get: () => ({
      calendarService: { getCalendarMonth: getCalendarMonthMock },
      notificationService: {
        countUnprocessedNotifications: countUnprocessedNotificationsMock,
        getPreferences: notificationPreferencesMock,
      },
    }),
  }
  let req
  let res
  const calendarData = ['sausages']
  const returnCalendarData = ['bacon']
  const notificationCount = 42
  const preferences = { preference: EMAIL }
  beforeEach(async () => {
    configureCalendar.mockReturnValue(returnCalendarData)
    getCalendarMonthMock.mockResolvedValue(calendarData)
    countUnprocessedNotificationsMock.mockResolvedValue(notificationCount)
    notificationPreferencesMock.mockResolvedValue(preferences)
    res = { render: renderMock, locals: { csrfToken } }
    req = {
      authUrl,
      user: { token, employeeName },
      body: { pauseUnit: 'days', pauseValue: 3 },
      app,
      params: { date: '2001-01-01' },
    }
    await calendarMiddleware(req, res, nextMock)
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
    it('should not call the next function', () => {
      expect(nextMock).not.toHaveBeenCalled()
    })
    it('should call the render function', () => {
      expect(renderMock).toHaveBeenCalledTimes(1)
    })
  })
})
