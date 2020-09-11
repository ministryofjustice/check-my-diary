require('jwt-decode')
const {
  configureCalendar,
  hmppsAuthMFAUser,
  getSnoozeUntil,
  appendUserErrorMessage,
  processDay,
  sortByDisplayType,
} = require('./utilities')
const { GENERAL_ERROR, NOT_FOUND_ERROR } = require('./errorConstants')

jest.mock('jwt-decode', () => (token) => token)

describe('configureCalendar', () => {
  const none = { date: '2020-08-03', fullDayType: 'None', details: [] }
  const rest = { date: '2020-08-02', fullDayType: 'Rest Day', details: [] }
  const noDay = { fullDayType: 'no-day' }
  let shift
  let returnedData
  beforeEach(() => {
    shift = { date: '2020-08-01', fullDayType: 'Shift', details: [] }
    returnedData = configureCalendar([none, rest, shift, ...new Array(28).fill(none)])
  })
  it('should return an array of objects', () => {
    expect(returnedData).toEqual(expect.arrayContaining([none, shift, rest, noDay]))
  })
  it('should prepend the "no day" elements to the start of the array', () => {
    expect(returnedData.slice(0, 6)).toEqual(new Array(6).fill(noDay))
  })
  it('should append the "no day" elements to the end of the array', () => {
    expect(returnedData.slice(-5)).toEqual(new Array(5).fill(noDay))
  })
  it('should order the array elements by date', () => {
    expect(returnedData.slice(6, 36)).toEqual([shift, rest, ...new Array(28).fill(none)])
  })
})

describe('processDay', () => {
  let detail1
  let detail2
  let day
  beforeEach(() => {
    detail1 = {
      displayTypeTime: '2020-08-03T07:15:00',
      displayType: 'DAY_START',
      finishDuration: null,
    }
    detail2 = {
      displayTypeTime: '2020-08-03T17:00:00',
      displayType: 'DAY_FINISH',
      finishDuration: '8h 45m',
    }
    day = {
      date: '2020-08-03',
      fullDayType: 'Shift',
      details: [detail2, detail1],
    }
    processDay(day)
  })
  it('should set the date text', () => {
    expect(day.dateText).toBe('3')
  })
  it('should set the date day text', () => {
    expect(day.dateDayText).toBe('Monday 3rd')
  })
  it('should set the activity text for the details', () => {
    expect(detail1.activity).toBe('Start 07:15')
    expect(detail2.activity).toBe('Finish 17:00')
  })
  it('should order the details by displayTypeTime', () => {
    expect(day.details).toEqual([detail1, detail2])
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
  it('should return false if the user does not have the ROLE_MFA role', () => {
    const token = { authorities: '' }
    expect(hmppsAuthMFAUser(token)).toEqual(false)
  })
})

describe('getSnoozeUntil', () => {
  let dateNow
  beforeEach(() => {
    dateNow = jest.spyOn(Date, 'now').mockImplementation(() => new Date('1/3/1994').getTime())
  })
  afterEach(() => {
    dateNow.mockRestore()
  })
  it('should return a formatted date string if the date is in the future', () => {
    expect(getSnoozeUntil(new Date('4/2/1994'))).toEqual('Sunday, 3rd April 1994')
  })
  it('should return an empty string if the date is in the past', () => {
    expect(getSnoozeUntil(new Date('26/2/1994'))).toEqual('')
  })
  it('should return an empty string if the date is undefined', () => {
    expect(getSnoozeUntil()).toEqual('')
  })
})

describe('appendUserErrorMessage', () => {
  let mrsError
  let returnedValue
  beforeEach(() => {
    mrsError = new Error()
  })
  describe('with a specific error message', () => {
    beforeEach(() => {
      returnedValue = appendUserErrorMessage(mrsError, NOT_FOUND_ERROR)
    })
    it('should return the error', () => {
      expect(returnedValue).toBe(mrsError)
    })
    it('should append a user error message', () => {
      expect(returnedValue.userMessage).toEqual(NOT_FOUND_ERROR)
    })
  })
  describe('with no specific error message', () => {
    it('should append a general user error message', () => {
      expect(appendUserErrorMessage(mrsError).userMessage).toEqual(GENERAL_ERROR)
    })
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
