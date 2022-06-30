import type { Request, Response } from 'express'
import CalendarDetailController from './calendarDetailController'

import utilities from '../helpers/utilities'
import { CalendarService } from '../services'

jest.mock('../helpers/utilities', () => ({
  sortByDisplayType: jest.fn(() => true),
  processDetail: jest.fn(),
}))
const processDetail = utilities.processDetail as jest.Mock
const sortByDisplayType = utilities.sortByDisplayType as jest.Mock

describe('calendar detail middleware', () => {
  const renderMock = jest.fn()
  const nextMock = jest.fn()
  const token = 'sausages'
  const employeeName = 'Ray Parker Jr.'
  const authUrl = ''
  const csrfToken = 'tomato'
  const getCalendarDayMock = jest.fn()
  const app = {}
  const calendarService: CalendarService = { getCalendarDay: getCalendarDayMock } as unknown as CalendarService
  let req: Request
  let res: Response
  const startTime = '2020-07-08T10:00:00'
  const endTime = '2020-07-08T20:00:00'
  const fullDayType = 'A_DAY_IN_THE_LIFE'
  const fullDayTypeDescription = 'Cooking breakfast'
  beforeEach(() => {
    res = { render: renderMock, locals: { csrfToken } } as unknown as Response
    req = {
      authUrl,
      user: { token, employeeName },
      body: { pauseUnit: 'days', pauseValue: 3 },
      app,
      params: { date: '2001-01-01' },
    } as unknown as Request
  })
  afterEach(() => {
    jest.resetAllMocks()
  })
  describe('with a rest day, with no valid shift details', () => {
    beforeEach(async () => {
      const detailsRestDay = [
        { start: startTime, end: startTime },
        { start: startTime, end: startTime },
      ]
      const calendarDataRestDay = {
        date: '2020-07-08T00:00:00',
        fullDayType,
        fullDayTypeDescription,
        details: detailsRestDay,
      }
      getCalendarDayMock.mockResolvedValue(calendarDataRestDay)
      await new CalendarDetailController(calendarService).details(req, res)
    })
    it('should request the day details', () => {
      expect(getCalendarDayMock).toHaveBeenCalledTimes(1)
    })
    it('should not try and sort the details', () => {
      expect(sortByDisplayType).not.toHaveBeenCalled()
    })
    it('should not try and process the details', () => {
      expect(processDetail).not.toHaveBeenCalled()
    })
    it('should try and render the page', () => {
      expect(renderMock).toHaveBeenCalledTimes(1)
    })
    it('should pass the correct render parameters', () => {
      expect(renderMock).toHaveBeenCalledWith('pages/calendar-details', {
        authUrl,
        backLink: '/calendar/2020-07-01',
        csrfToken,
        details: [],
        employeeName,
        fullDayType,
        fullDayTypeDescription,
        today: 'Wednesday, 8th July 2020',
        tomorrow: {
          link: '2020-07-09',
          text: 'Thursday, 9th',
        },
        yesterday: {
          link: '2020-07-07',
          text: 'Tuesday, 7th',
        },
      })
    })
  })
  describe('with a normal day shift', () => {
    const processReturn = ['topsy', 'tim']
    beforeEach(async () => {
      const details = [
        { start: startTime, end: endTime },
        { start: startTime, end: startTime },
      ]

      const calendarDataRestDay = {
        date: '2020-07-08T00:00:00',
        fullDayType: 'SHIFT',
        fullDayTypeDescription: 'Cooking breakfast',
        details,
      }
      processDetail.mockReturnValue(processReturn)
      getCalendarDayMock.mockResolvedValue(calendarDataRestDay)
      await new CalendarDetailController(calendarService).details(req, res)
    })
    it('should request the day details', () => {
      expect(getCalendarDayMock).toHaveBeenCalledTimes(1)
    })
    it('should try and sort the details', () => {
      expect(sortByDisplayType).toHaveBeenCalledTimes(1)
      expect(sortByDisplayType).toHaveBeenCalledWith([{ start: startTime, end: endTime }])
    })
    it('should try and process the details', () => {
      expect(processDetail).toHaveBeenCalledTimes(1)
      expect(processDetail).toHaveBeenCalledWith({ start: startTime, end: endTime }, 0, [
        { start: startTime, end: endTime },
      ])
    })
    it('should try and render the page', () => {
      expect(renderMock).toHaveBeenCalledTimes(1)
    })
    it('should pass the correct render parameters', () => {
      expect(renderMock).toHaveBeenCalledWith('pages/calendar-details', {
        authUrl,
        backLink: '/calendar/2020-07-01',
        csrfToken,
        details: processReturn,
        employeeName,
        fullDayType: 'SHIFT',
        fullDayTypeDescription: 'Cooking breakfast',
        today: 'Wednesday, 8th July 2020',
        tomorrow: {
          link: '2020-07-09',
          text: 'Thursday, 9th',
        },
        yesterday: {
          link: '2020-07-07',
          text: 'Tuesday, 7th',
        },
      })
    })
  })
})
