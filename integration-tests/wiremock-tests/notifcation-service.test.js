const { stubNotificationGet, stubNotificationUpdate } = require('../mockApis/notificationService')
const { resetStubs } = require('../mockApis/wiremock')
const notifcationService = require('../../server/services/notificationService')

describe('Wiremock setup for notification service', () => {
  beforeAll(async () => {
    await resetStubs()
    await stubNotificationGet()
    await stubNotificationUpdate()
  })

  test('notifcationService.get is stubbed', async () => {
    try {
      const response = await notifcationService.getPreferences()
      expect(response.status).toBe(200)
      expect(response.data).toEqual({ snoozeUntil: '2020-08-27' })
    } catch (error) {
      expect(error).toBeFalsy()
    }
  })

  test('notifcationService.updateSnooze is stubbed', async () => {
    try {
      const response = await notifcationService.updateSnooze()
      expect(response.status).toBe(200)
    } catch (error) {
      expect(error).toBeFalsy()
    }
  })
})
