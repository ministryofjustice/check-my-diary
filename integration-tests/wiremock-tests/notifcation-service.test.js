const {
  stubNotificationCount,
  stubNotificationPreferencesGet,
  stubNotificationUpdate,
} = require('../mockApis/notificationService')
const { resetStubs } = require('../mockApis/wiremock')
const notifciationService = require('../../server/services/notificationService')


describe('Wiremock setup for notification service', () => {
  beforeAll(async () => {
    await resetStubs()
    await stubNotificationCount()
    await stubNotificationPreferencesGet()
    await stubNotificationUpdate()
  })

  test('notificationService.getPreference is stubbed', async () => {
    try {
      const response = await notifciationService.getPreferences()
      expect(response.status).toBe(200)
      expect(response.data).toEqual({ snoozeUntil: '2020-08-27' })
    } catch (error) {
      expect(error).toBeFalsy()
    }
  })

  test('notificationService.updateSnooze is stubbed', async () => {
    try {
      const response = await notifciationService.updateSnooze()
      expect(response.status).toBe(200)
    } catch (error) {
      expect(error).toBeFalsy()
    }
  })
})
