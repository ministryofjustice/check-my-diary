import nock from 'nock'
import config from '../../config'
import signInService from './signInService'

const in15MinsDate = new Date('May 31, 2018 12:15:00')
const in15Mins = in15MinsDate.getTime()

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

  describe('getUser', () => {
    test('should return user object if all apis succeed', () => {
      const expectedOutput = {
        token: 'type token',
        refreshToken: 'refresh',
        username: 'un',
        refreshTime: in15Mins,
      }

      return expect(service.getUser('type token', 'refresh', '1200', 'un')).toEqual(expectedOutput)
    })
  })

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

  describe('getRefreshToken', () => {
    test('successfully get token', async () => {
      const expectedBody = 'grant_type=refresh_token&refresh_token=REFRESH_TOKEN-1'

      fakeOauthApi.post('/oauth/token', expectedBody).reply(200, {
        access_token: 'NEW_ACCESS_TOKEN-1',
        refresh_token: 'REFRESH_TOKEN-2',
        expires_in: 300,
      })

      const output = await service.getRefreshedToken({ username: 'Bob', refreshToken: 'REFRESH_TOKEN-1' })
      expect(output).toEqual({ refreshTime: in15Mins, refreshToken: 'REFRESH_TOKEN-2', token: 'NEW_ACCESS_TOKEN-1' })
    })
  })
})
