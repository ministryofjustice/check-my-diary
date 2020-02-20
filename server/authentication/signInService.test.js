const nock = require('nock')
const bunyan = require('bunyan')
const config = require('../../config')
const signInService = require('./signInService')

let logger

jest.genMockFromModule('bunyan')
jest.mock('bunyan')

beforeEach(() => {
  logger = {
    info: jest.fn(),
    error: jest.fn(),
  }

  bunyan.mockImplementation(() => logger)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('signInService', () => {
  let service
  let realDateNow

  beforeEach(() => {
    realDateNow = Date.now.bind(global.Date)
    const time = new Date('May 31, 2018 12:00:00')
    global.Date = jest.fn(() => time)
    service = signInService(logger)
  })

  afterEach(() => {
    global.Date.now = realDateNow
  })

  describe('getUser', () => {
    const in15Mins = new Date('May 31, 2018 12:15:00').getTime()

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

  describe('getRefreshToken', () => {
    let fakeOauthApi

    beforeEach(() => {
      fakeOauthApi = nock(config.nomis.authUrl)
    })

    afterEach(() => {
      nock.cleanAll()
    })

    test('successfully get token', async () => {
      const expectedBody = 'grant_type=refresh_token&refresh_token=REFRESH_TOKEN-1'
      const in15MinsDate = new Date('May 31, 2018 12:15:00')
      const in15Mins = in15MinsDate.getTime

      fakeOauthApi
        .post('/oauth/token', expectedBody)
        .reply(200, { access_token: 'NEW_ACCESS_TOKEN-1', refresh_token: 'REFRESH_TOKEN-2', expires_in: 300 })

      const output = await service.getRefreshedToken({ username: 'Bob', refreshToken: 'REFRESH_TOKEN-1' })
      expect(output).toEqual({
        refreshTime: in15Mins,
        refreshToken: 'REFRESH_TOKEN-2',
        token: 'NEW_ACCESS_TOKEN-1',
      })
    })
  })
})
