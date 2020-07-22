const auth = require('../mockApis/auth')
const { resetStubs } = require('../mockApis/wiremock')
const { stubTasks, stubShifts, stubOvertimeShifts } = require('../mockApis/prisonOfficerApi')
const { stubCount } = require('../mockApis/notificationService')
const { clearDb, createTablesInsertData } = require('../db/db')

module.exports = (on) => {
  on('task', {
    reset: () => Promise.all([clearDb(), resetStubs()]),

    getLoginUrl: auth.getLoginUrl,
    stubLogin: () => Promise.all([auth.stubLogin({})]),

    stubTasks,
    stubShifts,
    stubOvertimeShifts,

    stubCount,

    createTablesInsertData,
  })
}
