import type { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from './testutils/appSetup'

let app: Express

jest.mock('moment', () => () => jest.requireActual('moment')('2020-03-02T00:00:00.000Z'))

beforeEach(() => {
  app = appWithAllRoutes({})
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('calendar router', () => {
  describe('GET /', () => {
    it('should redirect to correct calendar month', () => {
      return request(app).get('/calendar').expect(302).expect('Location', '/calendar/2020-03-01')
    })
  })
})
