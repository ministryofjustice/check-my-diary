import type { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from './testutils/appSetup'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({})
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('index router', () => {
  describe('GET /', () => {
    it('should redirect to calendar page', () => {
      return request(app).get('/').expect(302).expect('Location', '/calendar#today')
    })
  })

  describe('GET /contact-us', () => {
    it('should render the contact us page', () => {
      return request(app)
        .get('/contact-us')
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('For queries about Check My Diary please call the Service Desk on')
          expect(res.text).toContain('f. last')
        })
    })
  })
})
