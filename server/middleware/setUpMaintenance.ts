import express, { Router } from 'express'
import moment from 'moment'

import config from '../../config'

export function setUpMaintenance(): Router {
  const router = express.Router()

  router.get('*', (req, res, next) => {
    try {
      const {
        maintenance: { start, end },
      } = config

      if (start && end) {
        const maintenanceStartDateTime = moment(start, 'YYYY-MM-DD HH:mm:ss')
        const maintenanceEndDateTime = moment(end, 'YYYY-MM-DD HH:mm:ss')
        const currentDateTime = moment()
        if (
          currentDateTime.isSameOrAfter(maintenanceStartDateTime) &&
          currentDateTime.isSameOrBefore(maintenanceEndDateTime)
        ) {
          const formatString = 'HH:mm on dddd Do MMMM'
          return res.render('pages/maintenance', {
            startDateTime: maintenanceStartDateTime.format(formatString),
            endDateTime: maintenanceEndDateTime.format(formatString),
            csrfToken: res.locals.csrfToken,
            employeeName: req.user?.employeeName,
            authUrl: req.authUrl,
          })
        }
      }
      return next()
    } catch (error) {
      return next(error)
    }
  })

  return router
}

export default {
  setUpMaintenance,
}
