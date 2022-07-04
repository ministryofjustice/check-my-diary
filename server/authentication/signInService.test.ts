import nock from 'nock'
import config from '../../config'
import signInService from './signInService'

let fakeOauthApi: nock.Scope

beforeEach(() => {
  fakeOauthApi = nock(config.apis.hmppsAuth.url)
})

afterEach(() => {
  nock.abortPendingRequests()
  nock.cleanAll()
})

describe('signInService', () => {
  const service = signInService()
  const time = new Date('May 31, 2018 12:00:00')
  jest.spyOn(global, 'Date').mockImplementation(() => time as unknown as string)

  describe('getMyMfaSettings', () => {
    test('successfully get mfa details', async () => {
      const responseData = {
        backupVerified: true,
        mobileVerified: false,
        emailVerified: false,
      }
      fakeOauthApi.get('/api/user/me/mfa').reply(200, responseData)

      const output = await service.getMyMfaSettings({ username: 'Bob', refreshToken: 'REFRESH_TOKEN-1' })
      expect(output).toEqual(responseData)
    })
  })
})
