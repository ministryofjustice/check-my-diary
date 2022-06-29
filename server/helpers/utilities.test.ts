import {
  configureCalendar,
  getSnoozeUntil,
  hmppsAuthMFAUser,
  processDay,
  processDetail,
  sortByDisplayType,
} from './utilities'

import type { CalendarDay, Details } from './utilities.types'

jest.mock('jwt-decode', () => (token: string) => token)

describe('configureCalendar', () => {
  const none = { date: '2020-08-03', fullDayType: 'None', details: [] }
  const rest = { date: '2020-08-02', fullDayType: 'Rest Day', details: [] }
  const noDay = { fullDayType: 'no-day' }
  let shift: CalendarDay
  let returnedData: CalendarDay[] | null
  beforeEach(() => {
    shift = { date: '2020-08-01', fullDayType: 'Shift', details: [] }
    returnedData = configureCalendar([none, rest, shift, ...new Array(28).fill(none)])
  })
  it('should return an array of objects', () => {
    expect(returnedData).toEqual(expect.arrayContaining([none, shift, rest, noDay]))
  })
  it('should prepend the "no day" elements to the start of the array', () => {
    expect(returnedData?.slice(0, 6)).toEqual(new Array(6).fill(noDay))
  })
  it('should append the "no day" elements to the end of the array', () => {
    expect(returnedData?.slice(-5)).toEqual(new Array(5).fill(noDay))
  })
  it('should order the array elements by date', () => {
    expect(returnedData?.slice(6, 36)).toEqual([shift, rest, ...new Array(28).fill(none)])
  })
})

describe('processDay', () => {
  let detail1: Details
  let detail2: Details
  let detail3: Details
  let day1: CalendarDay
  let day2: CalendarDay
  beforeEach(() => {
    detail1 = {
      displayTypeTime: '2020-08-03T07:15:00',
      displayType: 'DAY_START',
      finishDuration: null,

      // TODO: seems to be confusion here;
      //  detail contents seem to be wrong - e.g. from real run:
      // {
      //   "activity": "Rest Day",
      //   "start": "2021-11-07T00:00:00",
      //   "end": "2021-11-07T00:00:00",
      //   "parentType": "SHIFT",
      //   "displayType": null,
      //   "displayTypeTime": null,
      //   "finishDuration": null
      // }
    }
    detail2 = {
      displayTypeTime: '2020-08-03T17:00:00',
      displayType: 'DAY_FINISH',
      finishDuration: '8h 45m',
    }
    detail3 = {
      displayTypeTime: '2020-08-04T00:00:00',
      displayType: 'ALL_DAY',
      finishDuration: '24h',
    }
    day1 = {
      date: '2020-08-03',
      fullDayType: 'Shift',
      details: [detail2, detail1],
    }
    day2 = {
      date: '2020-08-04',
      fullDayType: 'Shift',
      details: [detail3],
    }
    processDay(day1)
    processDay(day2)
  })
  it('should set the date text', () => {
    expect(day1.dateText).toBe('3')
  })
  it('should set the date day text', () => {
    expect(day1.dateDayText).toBe('Monday 3rd')
  })
  it('should set the activity text for the details', () => {
    expect(detail1.activity).toBe('Start 07:15')
    expect(detail2.activity).toBe('Finish 17:00')
  })
  it('should order the details by displayTypeTime', () => {
    expect(day1.details).toEqual([detail1, detail2])
  })
})

describe('hmppsAuthMFAUser', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })
  it('should return true if the user has the ROLE_MFA role', () => {
    const token = { authorities: 'ROLE_MFA' }
    expect(hmppsAuthMFAUser(token)).toEqual(true)
  })
  it('should return true if the user has the ROLE_CMD_MIGRATED_MFA role', () => {
    const token = { authorities: 'ROLE_CMD_MIGRATED_MFA' }
    expect(hmppsAuthMFAUser(token)).toEqual(true)
  })
  it('should return false if the user does not have the ROLE_MFA or ROLE_CMD_MIGRATED_MFA roles', () => {
    const token = { authorities: '' }
    expect(hmppsAuthMFAUser(token)).toEqual(false)
  })
})

describe('getSnoozeUntil', () => {
  let dateNow: jest.SpiedFunction<() => number>
  beforeEach(() => {
    dateNow = jest.spyOn(Date, 'now').mockImplementation(() => new Date('1/3/1994').getTime())
  })
  afterEach(() => {
    dateNow.mockRestore()
  })
  it('should return a formatted date string if the date is in the future', () => {
    expect(getSnoozeUntil(new Date('4/2/1994'))).toEqual('3 April 1994')
    expect(getSnoozeUntil(new Date('9/17/1994'))).toEqual('18 September 1994')
  })
  it('should return an empty string if the date is in the past', () => {
    expect(getSnoozeUntil(new Date('6/14/1993'))).toEqual('')
    expect(getSnoozeUntil(new Date('1/1/1994'))).toEqual('')
  })
  it('should return an empty string if the date is undefined', () => {
    expect(getSnoozeUntil()).toEqual('')
  })
})

describe('sortByDisplayType', () => {
  const detail1 = { displayTypeTime: '2020-08-03T07:30:00', displayType: 'line overtime_day_start' }
  const detail2a = { displayTypeTime: '2020-08-03T12:25:00', displayType: 'line overtime_day_finish' }
  const detail2b = { displayTypeTime: '2020-08-03T12:30:00', displayType: 'line overtime_day_finish' }
  const detail3 = { displayTypeTime: '2020-08-03T12:30:00', displayType: 'day_start' }
  const detail4 = { displayTypeTime: '2020-08-03T17:30:00', displayType: 'day_finish' }

  describe('with a dates out of order', () => {
    it('should return items in date order', () => {
      const initialArray = [detail3, detail1, detail4, detail2a]
      sortByDisplayType(initialArray)
      expect(initialArray).toEqual([detail1, detail2a, detail3, detail4])
    })
  })
  describe('with a start types before end types out of order', () => {
    it('should return items in date order, and prioritise none start display types', () => {
      const initialArray = [detail4, detail3, detail2b, detail1]
      sortByDisplayType(initialArray)
      expect(initialArray).toEqual([detail1, detail2b, detail3, detail4])
    })
  })
})
describe('processDetail', () => {
  const activity = 'Bicycle Race'
  const detail1 = { activity, start: '2020-07-08T10:00:00', end: '2020-07-08T16:30:00', displayType: 'DAY_START' }
  const detail2a = { activity, start: '2020-07-08T10:00:00', end: '2020-07-08T16:30:00', displayType: 'DAY_FINISH' }
  const detail2b = { activity, start: '2020-07-08T14:00:00', end: '2020-07-08T16:30:00', displayType: 'DAY_FINISH' }
  describe('with no overtime', () => {
    describe('with basic start data', () => {
      it('should produce readable time stamps', () => {
        expect(processDetail(detail1, 0, [detail1, detail2a])).toEqual({
          activity,
          start: '10:00',
          end: '16:30',
          displayType: 'day_start',
        })
      })
    })
    describe('with basic finish data', () => {
      it('should produce readable time stamps', () => {
        expect(processDetail(detail2a, 1, [detail1, detail2a])).toEqual({
          activity: '',
          start: '',
          end: '16:30',
          displayType: 'day_finish',
        })
      })
    })
    describe('with unique shift data in the finish data', () => {
      it('should return an array containing an activity detail and a finish detail', () => {
        expect(processDetail(detail2b, 1, [detail1, detail2b])).toEqual([
          { activity, start: '14:00', end: '16:30', displayType: 'activity' },
          { end: '16:30', displayType: 'day_finish' },
        ])
      })
    })
  })
  describe('with overtime', () => {
    const activity2 = 'One Vision'
    const detail3 = {
      activity: activity2,
      start: '2020-07-08T12:00:00',
      end: '2020-07-08T14:00:00',
      displayType: 'OVERTIME_DAY_START',
    }
    const detail4a = {
      activity: activity2,
      start: '2020-07-08T12:00:00',
      end: '2020-07-08T14:00:00',
      displayType: 'OVERTIME_DAY_FINISH',
    }
    const detail4b = {
      activity: activity2,
      start: '2020-07-08T13:00:00',
      end: '2020-07-08T14:00:00',
      displayType: 'OVERTIME_DAY_FINISH',
    }
    describe('with basic overtime start data', () => {
      it('should produce readable time stamps', () => {
        expect(processDetail(detail3, 1, [detail1, detail3, detail4a, detail2a])).toEqual({
          activity: activity2,
          start: '12:00',
          end: '14:00',
          displayType: 'overtime_day_start',
        })
      })
    })
    describe('with basic overtime finish data', () => {
      it('should return an overtime finish detail', () => {
        expect(processDetail(detail4a, 2, [detail1, detail3, detail4a, detail2a])).toEqual({
          activity: '',
          start: '',
          end: '14:00',
          displayType: 'overtime_day_finish',
        })
      })
    })
    describe('with unique shift data in the overtime finish data', () => {
      it('should return an array containing an activity detail and an overtime finish detail', () => {
        expect(processDetail(detail4b, 2, [detail1, detail3, detail4b, detail2a])).toEqual([
          { activity: activity2, start: '13:00', end: '14:00', displayType: 'activity' },
          { end: '14:00', displayType: 'overtime_day_finish' },
        ])
      })
    })
  })
})
