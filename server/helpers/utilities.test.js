require('jwt-decode')
const { hmppsAuthMFAUser } = require('./utilities')

jest.mock('jwt-decode', () => (token) => token)

describe('hmppsAuthMFAUser', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })
  it('should return true if the user has the ROLE_MFA role', () => {
    const token = { authorities: ['ROLE_PRISON', 'ROLE_MFA'] }
    expect(hmppsAuthMFAUser(token)).toEqual(true)
  })
  it('should return true if the user has the ROLE_MAINTAIN_ACCESS_ROLES role', () => {
    const token = { authorities: ['ROLE_PRISON', 'ROLE_MAINTAIN_ACCESS_ROLES'] }
    expect(hmppsAuthMFAUser(token)).toEqual(true)
  })
  it('should return true if the user has the ROLE_MAINTAIN_ACCESS_ROLES_ADMIN role', () => {
    const token = { authorities: ['ROLE_PRISON', 'ROLE_MAINTAIN_ACCESS_ROLES_ADMIN'] }
    expect(hmppsAuthMFAUser(token)).toEqual(true)
  })
  it('should return true if the user has the ROLE_MAINTAIN_OAUTH_USERS role', () => {
    const token = { authorities: ['ROLE_PRISON', 'ROLE_MAINTAIN_OAUTH_USERS'] }
    expect(hmppsAuthMFAUser(token)).toEqual(true)
  })
  it('should return true if the user has the ROLE_AUTH_GROUP_MANAGER role', () => {
    const token = { authorities: ['ROLE_PRISON', 'ROLE_AUTH_GROUP_MANAGER'] }
    expect(hmppsAuthMFAUser(token)).toEqual(true)
  })
  it('should return false if the user does not have an mfa role', () => {
    const token = { authorities: ['ROLE_PRISON'] }
    expect(hmppsAuthMFAUser(token)).toEqual(false)
  })
})
