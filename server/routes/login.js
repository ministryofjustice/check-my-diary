const router = require('express').Router()
const jwtDecode = require('jwt-decode')
const moment = require('moment')
const logError = require('../logError')
const config = require('../../config')
const utilities = require('../helpers/utilities')

router.get('/', async (req, res) => postLogin(req, res))

router.get('/auth/login', async (req, res) => postLogin(req, res))

function postLogin(req, res) {
  try {
    if (!utilities.isNullOrEmpty(config.maintenance.start) && !utilities.isNullOrEmpty(config.maintenance.end)) {
      // eslint-disable-next-line vars-on-top
      const maintenanceStartDateTime = moment(config.maintenance.start)
      const maintenanceEndDateTime = moment(config.maintenance.end)
      const currentDateTime = moment()
      if (
        currentDateTime.isSameOrAfter(maintenanceStartDateTime) &&
        currentDateTime.isSameOrBefore(maintenanceEndDateTime)
      ) {
        res.render('pages/maintenance', {
          startDateTime: maintenanceStartDateTime.format('hh:mm on dddd Do MMMM YYYY'),
          endDateTime: maintenanceEndDateTime.format('hh:mm on dddd Do MMMM YYYY'),
          csrfToken: res.locals.csrfToken,
        })
        return
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-undef
    logError(req.url, data, 'Login failure')
  }
  req.user.employeeName = jwtDecode(req.user.token).name
  res.redirect(`/calendar/${utilities.getStartMonth()}`)
}

module.exports = router
