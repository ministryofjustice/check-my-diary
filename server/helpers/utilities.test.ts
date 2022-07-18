import utilities from './utilities'
import createToken from '../routes/testutils/createToken'

import type { CalendarDay, Details } from './utilities.types'

describe('configureCalendar', () => {
  const none = { date: '2020-08-03', activity: 'act-3', details: [] }
  const rest = { date: '2020-08-02', activity: 'act-2', details: [] }
  const noDay = { fullDayType: 'no-day' }
  const shift: CalendarDay = { date: '2020-08-01', activity: 'act-1', fullDayType: 'type', details: [] }
  let returnedData: CalendarDay[]
  beforeEach(() => {
    returnedData = utilities.configureCalendar([none, rest, shift, ...new Array(28).fill(none)]) as CalendarDay[]
  })
  it('should return an array of objects', () => {
    expect(returnedData).toHaveLength(42)
  })
  it('should prepend the "no day" elements to the start of the array', () => {
    expect(returnedData.slice(0, 6)).toEqual(new Array(6).fill(noDay))
  })
  it('should append the "no day" elements to the end of the array', () => {
    expect(returnedData.slice(-5)).toEqual(new Array(5).fill(noDay))
  })
  it('should order the array elements by date', () => {
    expect(returnedData[6].date).toEqual('2020-08-01')
    expect(returnedData[7].date).toEqual('2020-08-02')
    expect(returnedData[8].date).toEqual('2020-08-03')
    expect(returnedData[9].date).toEqual('2020-08-03')
  })
})

describe('processDay', () => {
  let detail1: Details
  let detail2: Details
  let day1: CalendarDay
  let dayNights: CalendarDay
  beforeEach(() => {
    detail1 = {
      activity: 'Duty Manager',
      displayTypeTime: '2020-08-03T07:15:00',
      displayType: 'DAY_START',
      finishDuration: null,
    }
    detail2 = {
      activity: 'Duty Manager',
      displayTypeTime: '2020-08-03T17:00:00',
      displayType: 'DAY_FINISH',
      finishDuration: 8 * 3600 + 45 * 60,
    }
    const day1Input = {
      date: '2020-08-03',
      fullDayType: 'Shift',
      details: [detail2, detail1],
    }
    const dayNightsInput = {
      date: '2020-03-27',
      fullDayType: 'SHIFT',
      fullDayTypeDescription: 'Shift',
      details: [
        {
          activity: 'Night Duties',
          start: '2020-03-26T22:30:00',
          end: '2020-03-27T04:30:00',
          parentType: 'SHIFT',
          displayType: 'NIGHT_FINISH',
          displayTypeTime: '2020-03-27T04:30:00',
          finishDuration: 32400,
        },
        {
          activity: 'Night Duties',
          start: '2020-03-27T22:45:00',
          end: '2020-03-28T05:30:00',
          parentType: 'SHIFT',
          displayType: 'NIGHT_START',
          displayTypeTime: '2020-03-27T22:45:00',
        },
      ],
    }
    day1 = utilities.processDay(day1Input)
    dayNights = utilities.processDay(dayNightsInput)
  })
  it('should set the date text', () => {
    expect(day1.dateText).toBe('3')
  })
  it('should set the date day text', () => {
    expect(day1.dateDayText).toBe('Monday 3')
  })
  it('should set the activity text for the details and order by displayTypeTime', () => {
    expect(day1.details[0].lineLeftText).toBe('Start: 07:15')
    expect(day1.details[1].lineLeftText).toBe('Finish: 17:00')
  })
  it('should display a line and duration in black for consecutive night shifts', () => {
    expect(dayNights.details).toEqual([
      {
        activity: 'Night Duties',
        lineLeftText: 'Night shift finish: 04:30',
        lineRightText: 'Night Duties',
        activityDescription: 'Night Duties',
        displayType: 'night_finish',
        displayTypeTime: '2020-03-27T04:30:00',
        end: '2020-03-27T04:30:00',
        finishDuration: '9 hours ',
        parentType: 'SHIFT',
        showNightHr: false,
        start: '2020-03-26T22:30:00',
        durationColour: 'night_finish',
        specialActivityColour: '',
      },
      {
        activity: 'Night Duties',
        lineLeftText: 'Night shift start: 22:45',
        lineRightText: 'Night Duties',
        activityDescription: 'Night Duties',
        displayType: 'night_start',
        displayTypeTime: '2020-03-27T22:45:00',
        end: '2020-03-28T05:30:00',
        parentType: 'SHIFT',
        showNightHr: true,
        start: '2020-03-27T22:45:00',
        durationColour: '',
        specialActivityColour: '',
      },
    ])
  })
})

describe('hmppsAuthMFAUser', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })
  it('should return true if the user has the ROLE_MFA role', () => {
    const token = createToken('username', 'employeeName', ['ROLE_MFA'])
    expect(utilities.hmppsAuthMFAUser(token)).toEqual(true)
  })
  it('should return true if the user has the ROLE_CMD_MIGRATED_MFA role', () => {
    const token = createToken('username', 'employeeName', ['ROLE_CMD_MIGRATED_MFA'])
    expect(utilities.hmppsAuthMFAUser(token)).toEqual(true)
  })
  it('should return false if the user does not have the ROLE_MFA or ROLE_CMD_MIGRATED_MFA roles', () => {
    const token = createToken('username', 'employeeName', [])
    expect(utilities.hmppsAuthMFAUser(token)).toEqual(false)
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
    expect(utilities.getSnoozeUntil(new Date('4/2/1994'))).toEqual('3 April 1994')
    expect(utilities.getSnoozeUntil(new Date('9/17/1994'))).toEqual('18 September 1994')
  })
  it('should return an empty string if the date is in the past', () => {
    expect(utilities.getSnoozeUntil(new Date('6/14/1993'))).toEqual('')
    expect(utilities.getSnoozeUntil(new Date('1/1/1994'))).toEqual('')
  })
  it('should return an empty string if the date is undefined', () => {
    expect(utilities.getSnoozeUntil()).toEqual('')
  })
})

describe('sortByDisplayType', () => {
  const activity = 'dummy'
  const detail1 = { displayTypeTime: '2020-08-03T07:30:00', displayType: 'line overtime_day_start', activity }
  const detail2a = { displayTypeTime: '2020-08-03T12:25:00', displayType: 'line overtime_day_finish', activity }
  const detail2b = { displayTypeTime: '2020-08-03T12:30:00', displayType: 'line overtime_day_finish', activity }
  const detail3 = { displayTypeTime: '2020-08-03T12:30:00', displayType: 'day_start', activity }
  const detail4 = { displayTypeTime: '2020-08-03T17:30:00', displayType: 'day_finish', activity }

  describe('with a dates out of order', () => {
    it('should return items in date order', () => {
      const initialArray = [detail3, detail1, detail4, detail2a]
      utilities.sortByDisplayType(initialArray)
      expect(initialArray).toEqual([detail1, detail2a, detail3, detail4])
    })
  })
  describe('with a start types before end types out of order', () => {
    it('should return items in date order, and prioritise none start display types', () => {
      const initialArray = [detail4, detail3, detail2b, detail1]
      utilities.sortByDisplayType(initialArray)
      expect(initialArray).toEqual([detail1, detail2b, detail3, detail4])
    })
  })
})

const processDetailWrapper = (detail: Details) => {
  const day = { details: [detail], date: '2022-05-25', fullDayType: 'NONE' }
  return utilities.processDay(day).details[0]
}

describe('processDetail', () => {
  const activity = 'Bicycle Race'
  const detail1 = {
    activity,
    start: '2020-07-08T10:00:00',
    end: '2020-07-08T16:30:00',
    displayType: 'DAY_START',
    displayTypeTime: '2020-07-08T10:00:00',
  }
  const detail2a = {
    activity,
    start: '2020-07-08T10:00:00',
    end: '2020-07-08T16:30:00',
    displayType: 'DAY_FINISH',
    displayTypeTime: '2020-07-08T16:30:00',
  }
  const detail2b = {
    activity,
    start: '2020-07-08T14:00:00',
    end: '2020-07-08T16:30:00',
    displayType: 'DAY_FINISH',
    displayTypeTime: '2020-07-08T16:30:00',
  }
  describe('with no overtime', () => {
    describe('with basic start data', () => {
      it('should produce readable time stamps', () => {
        expect(processDetailWrapper(detail1)).toEqual({
          lineLeftText: 'Start: 10:00',
          lineRightText: activity,
          activity,
          activityDescription: activity,
          start: '2020-07-08T10:00:00',
          end: '2020-07-08T16:30:00',
          displayType: 'day_start',
          displayTypeTime: '2020-07-08T10:00:00',
          specialActivityColour: '',
          durationColour: '',
          showNightHr: false,
        })
      })
    })
    describe('with basic finish data', () => {
      it('should produce readable time stamps', () => {
        expect(processDetailWrapper(detail2a)).toEqual({
          lineLeftText: 'Finish: 16:30',
          lineRightText: activity,
          activity,
          activityDescription: activity,
          start: '2020-07-08T10:00:00',
          end: '2020-07-08T16:30:00',
          displayType: 'day_finish',
          displayTypeTime: '2020-07-08T16:30:00',
          specialActivityColour: '',
          durationColour: '',
          showNightHr: false,
        })
      })
    })
    describe('with unique shift data in the finish data', () => {
      it('should return an array containing an activity detail and a finish detail', () => {
        expect(processDetailWrapper(detail2b)).toEqual({
          lineLeftText: 'Finish: 16:30',
          lineRightText: activity,
          activity,
          activityDescription: activity,
          start: '2020-07-08T14:00:00',
          end: '2020-07-08T16:30:00',
          displayType: 'day_finish',
          displayTypeTime: '2020-07-08T16:30:00',
          specialActivityColour: '',
          durationColour: '',
          showNightHr: false,
        })
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
      displayTypeTime: '2020-07-08T12:00:00',
    }
    const detail4a = {
      activity: activity2,
      start: '2020-07-08T12:00:00',
      end: '2020-07-08T14:00:00',
      displayType: 'OVERTIME_DAY_FINISH',
      displayTypeTime: '2020-07-08T14:00:00',
    }
    const detail4b = {
      activity: activity2,
      start: '2020-07-08T13:00:00',
      end: '2020-07-08T14:00:00',
      displayType: 'OVERTIME_DAY_FINISH',
      displayTypeTime: '2020-07-08T14:00:00',
    }
    describe('with basic overtime start data', () => {
      it('should produce readable time stamps', () => {
        expect(processDetailWrapper(detail3)).toEqual({
          lineLeftText: 'Overtime start: 12:00',
          lineRightText: activity2,
          activity: activity2,
          activityDescription: activity2,
          start: '2020-07-08T12:00:00',
          end: '2020-07-08T14:00:00',
          displayType: 'overtime_day_start',
          displayTypeTime: '2020-07-08T12:00:00',
          specialActivityColour: '',
          durationColour: '',
          showNightHr: false,
        })
      })
    })
    describe('with basic overtime finish data', () => {
      it('should return an overtime finish detail', () => {
        expect(processDetailWrapper(detail4a)).toEqual({
          lineLeftText: 'Overtime finish: 14:00',
          lineRightText: activity2,
          activity: activity2,
          activityDescription: activity2,
          start: '2020-07-08T12:00:00',
          end: '2020-07-08T14:00:00',
          displayType: 'overtime_day_finish',
          displayTypeTime: '2020-07-08T14:00:00',
          specialActivityColour: '',
          durationColour: '',
          showNightHr: false,
        })
      })
    })
    describe('with unique shift data in the overtime finish data', () => {
      it('should return an array containing an activity detail and an overtime finish detail', () => {
        expect(processDetailWrapper(detail4b)).toEqual({
          lineLeftText: 'Overtime finish: 14:00',
          lineRightText: activity2,
          activity: activity2,
          activityDescription: activity2,
          start: '2020-07-08T13:00:00',
          end: '2020-07-08T14:00:00',
          displayType: 'overtime_day_finish',
          displayTypeTime: '2020-07-08T14:00:00',
          specialActivityColour: '',
          durationColour: '',
          showNightHr: false,
        })
      })
    })
  })
})
