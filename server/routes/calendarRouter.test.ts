import type { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from './testutils/appSetup'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ hmppsAuthMFAUser: true })
  jest.useFakeTimers({
    doNotFake: ['setImmediate', 'clearImmediate', 'setInterval', 'clearInterval'],
  })
  jest.setSystemTime(new Date('2020-03-02'))
})

afterEach(() => {
  jest.resetAllMocks()
  jest.useRealTimers()
})

describe('calendar router', () => {
  describe('GET /', () => {
    it('should redirect to correct calendar month', () =>
      request(app).get('/calendar').expect(302).expect('Location', '/calendar/2020-03-01'))
  })
})
