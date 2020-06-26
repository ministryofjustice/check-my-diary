const stubNotificationService = require('../mockApis/notificationService')
const { resetStubs } = require('../mockApis/wiremock')
const config = require('../../config')
const notifcationService = require('../../server/services/notificationService')

describe('Wiremock setup for notification service', () => {
  beforeAll(async () => {
    await resetStubs()
    await stubNotificationService()
  })

  test('Notifcation service is stubbed', async () => {
    try {
      expect(config.notifcationService.url).toEqual('http://localhost:9191/notifications-service')
      const response = await notifcationService().get(config.notifcationService.url)
      expect(response.status).toBe(200)
      expect(response.data).toEqual({ testEndpoint: true })
    } catch (error) {
      expect(error).toBeFalsy()
    }
  })
})
