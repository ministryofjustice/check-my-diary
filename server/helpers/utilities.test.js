require('jwt-decode')
const { hmppsAuthMFAUser } = require('./utilities')

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
