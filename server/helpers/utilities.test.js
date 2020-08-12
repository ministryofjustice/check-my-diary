require('jwt-decode')
const { hmppsAuthMFAUser, getSnoozeUntil, appendUserErrorMessage } = require('./utilities')
const { GENERAL_ERROR, NOT_FOUND_ERROR } = require('./errorConstants')

jest.mock('jwt-decode', () => (token) => token)

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
