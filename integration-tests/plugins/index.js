const auth = require('../mockApis/auth')
const { resetStubs } = require('../mockApis/wiremock')
const { stubShifts } = require('../mockApis/prisonOfficerApi')
const {
  stubNotificationPreferencesGet,
  stubNotificationUpdate,
  stubNotificationGet,
  stubNotificationCount,
} = require('../mockApis/notificationService')

module.exports = (on) => {
  on('task', {
    reset: () => Promise.all([resetStubs()]),

    getLoginUrl: auth.getLoginUrl,
    stubLogin: () => Promise.all([auth.stubLogin({})]),

    stubShifts,

    stubNotificationCount,

    stubNotifcations: () =>
      Promise.all([stubNotificationPreferencesGet(), stubNotificationUpdate(), stubNotificationGet()]),
  })
}
