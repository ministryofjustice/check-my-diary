const auth = require('../mockApis/auth')
const { resetStubs } = require('../mockApis/wiremock')
const { stubShifts } = require('../mockApis/prisonOfficerApi')
const {
  stubNotificationPreferencesGet,
  stubNotificationUpdate,
  stubNotificationGet,
  stubNotificationCount,
} = require('../mockApis/notificationService')
const { clearDb, createTablesInsertData } = require('../db/db')

module.exports = (on) => {
  on('task', {
    reset: () => Promise.all([clearDb(), resetStubs()]),

    getLoginUrl: auth.getLoginUrl,
    stubLogin: () => Promise.all([auth.stubLogin({})]),

    stubShifts,

    createTablesInsertData,
    stubNotificationCount,

    stubNotifcations: () =>
      Promise.all([stubNotificationPreferencesGet(), stubNotificationUpdate(), stubNotificationGet()]),
  })
}
