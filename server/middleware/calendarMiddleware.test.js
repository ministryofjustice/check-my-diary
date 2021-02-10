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
  const getCalendarMonthMock = jest.fn()
  const app = {
    get: () => ({
      calendarService: { getCalendarMonth: getCalendarMonthMock },
    }),
  }
  let req
  let res
  const calendarData = ['sausages']
  const returnCalendarData = ['bacon']
  beforeEach(async () => {
    configureCalendar.mockReturnValue(returnCalendarData)
    getCalendarMonthMock.mockResolvedValue(calendarData)
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
