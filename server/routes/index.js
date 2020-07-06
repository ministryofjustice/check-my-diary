const router = require('express').Router()

const createLoginRouter = require('./login')
const createCalendarRouter = require('./calendar')
const createCalendarDetailRouter = require('./calendar-detail')
const createMaintenanceRouter = require('./maintenance')
const createNotificationRouter = require('./notification')
const authenticationMiddleware = require('../middleware/authenticationMiddleware')
const csrfTokenMiddleware = require('../middleware/csrfTokenMiddleware')
const authHandlerMiddleware = require('../middleware/authHandlerMiddleware')

router.use([authenticationMiddleware, csrfTokenMiddleware])
createLoginRouter(router)

router.use(authHandlerMiddleware)
createCalendarRouter(router)
createCalendarDetailRouter(router)
createNotificationRouter(router)
createMaintenanceRouter(router)

module.exports = router
