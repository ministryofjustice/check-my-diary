const auth = require('../mockApis/auth')
const { resetStubs } = require('../mockApis/wiremock')
const { stubTasks, stubShifts, stubOvertimeShifts, stubHealthCalls } = require('../mockApis/prisonOfficerApi')
const { clearDb, createTablesInsertData } = require('../db/db')

module.exports = (on) => {
  on('task', {
    reset: () => Promise.all([clearDb(), resetStubs()]),

    getLoginUrl: auth.getLoginUrl,
    stubLogin: () => Promise.all([auth.stubLogin({})]),

    stubTasks,
    stubShifts,
    stubOvertimeShifts,
    stubHealthCalls,

    createTablesInsertData,
  })
}
