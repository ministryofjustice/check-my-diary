const calendarMiddleware = require('./calendarMiddleware')
const { configureCalendar } = require('../helpers/utilities')

jest.mock('../helpers/utilities', () => ({
  configureCalendar: jest.fn(),
  processDay: jest.fn(() => true),
  appendUserErrorMessage: jest.fn((error) => error),
}))

describe('calendar middleware', () => {
  const renderMock = jest.fn()
  const nextMock = jest.fn()
  const token = 'sausages'
  const employeeName = 'Ray Parker Jr.'
  const hmppsAuthMFAUser = ''
  const authUrl = ''
  const csrfToken = 'tomato'
  const getCalendarDataMock = jest.fn()
  const countUnprocessedNotificationsMock = jest.fn()
  const app = {
    get: () => ({
      calendarService: { getCalendarData: getCalendarDataMock },
      notificationService: { countUnprocessedNotifications: countUnprocessedNotificationsMock },
    }),
  }
  let req
  let res
  const calendarData = ['sausages']
  const returnCalendarData = ['bacon']
  const notificationCount = 42
  beforeEach(async () => {
    configureCalendar.mockReturnValue(returnCalendarData)
    getCalendarDataMock.mockResolvedValue(calendarData)
    countUnprocessedNotificationsMock.mockResolvedValue(notificationCount)
    res = { render: renderMock, locals: { csrfToken } }
    req = {
      hmppsAuthMFAUser,
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
      expect(getCalendarDataMock).toHaveBeenCalledTimes(1)
    })
    it('should not call the next function', () => {
      expect(nextMock).not.toHaveBeenCalled()
    })
    it('should call the render function', () => {
      expect(renderMock).toHaveBeenCalledTimes(1)
    })
  })
})
