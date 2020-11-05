const {
  stubNotificationCount,
  stubNotificationPreferencesGet,
  stubNotificationUpdate,
} = require('../mockApis/notificationService')
const { resetStubs } = require('../mockApis/wiremock')
const notifciationService = require('../../server/services/notificationService')

const fakeShiftNotifications = [
  {
    description: 'Your activity on Wednesday 29 May 2019 at 17:00 - 17:30 has changed to [Paternity Leave].',
    shiftModified: '2019-05-29T13:53:01.000Z',
    processed: true,
  },
  {
    description: 'Your activity on Wednesday 29 May 2019 at 15:00 - 17:00 has changed to [FMI Training].',
    shiftModified: '2019-05-29T13:46:19.000Z',
    processed: true,
  },
  {
    description: 'Your activity on Wednesday 29 May 2019 at 17:00 - 17:30 has changed to [Late Roll (OSG)].',
    shiftModified: '2019-05-29T13:43:37.000Z',
    processed: true,
  },
  {
    description: 'Your activity on Wednesday 29 May 2019 at 15:00 - 17:00 has changed to [FMI Training].',
    shiftModified: '2019-05-29T13:36:43.000Z',
    processed: true,
  },
]

describe('Wiremock setup for notification service', () => {
  beforeAll(async () => {
    await resetStubs()
    await stubNotificationCount()
    await stubNotificationPreferencesGet()
    await stubNotificationUpdate()
  })

  test('notificationService.count is stubbed', async () => {
    try {
      const response = await notifciationService.countUnprocessedNotifications()
      expect(response.status).toBe(200)
      expect(response.data).toEqual(fakeShiftNotifications)
    } catch (error) {
      expect(error).toBeFalsy()
    }
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
