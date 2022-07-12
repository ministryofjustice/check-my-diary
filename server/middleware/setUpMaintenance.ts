import express, { Router } from 'express'
import { differenceInSeconds, format } from 'date-fns'

import config from '../config'

export default function setUpMaintenance(): Router {
  const router = express.Router()

  router.get('*', (req, res, next) => {
    try {
      const {
        maintenance: { start, end },
      } = config

      if (start && end) {
        const maintenanceStartDateTime = new Date(start)
        const maintenanceEndDateTime = new Date(end)
        const currentDateTime = new Date()
        if (
          differenceInSeconds(currentDateTime, maintenanceStartDateTime) > 0 &&
          differenceInSeconds(currentDateTime, maintenanceEndDateTime) < 0
        ) {
          const formatString = "HH:mm 'on' EEEE do MMMM"
          return res.render('pages/maintenance.njk', {
            startDateTime: format(maintenanceStartDateTime, formatString),
            endDateTime: format(maintenanceEndDateTime, formatString),
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
