/* eslint-disable no-param-reassign */
import nunjucks from 'nunjucks'
import express from 'express'
import * as pathModule from 'path'
import { Result, ValidationError } from 'express-validator'

import { getRelativeModifiedDate, initialiseName } from './utils'
import config from '../config'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express, path: pathModule.PlatformPath): void {
  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'Check my diary'
  app.locals.googleAnalyticsId = process.env.GOOGLE_ANALYTICS_ID

  // Cachebusting version string
  if (production) {
    // Version only changes on reboot
    app.locals.version = Date.now().toString()
  } else {
    // Version changes every request
    app.use((req, res, next) => {
      res.locals.version = Date.now().toString()
      return next()
    })
  }

  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      'node_modules/govuk-frontend/dist/',
      'node_modules/@ministryofjustice/frontend/',
    ],
    {
      express: app,
    },
  )

  njkEnv.addFilter('initialiseName', initialiseName)
  njkEnv.addFilter('getRelativeModifiedDate', getRelativeModifiedDate)

  njkEnv.addFilter('findError', (errors: Result<ValidationError>, formFieldId: string) => {
    const item = errors.mapped()[formFieldId]
    if (item) {
      return {
        text: item.msg,
      }
    }
    return null
  })
  njkEnv.addFilter('mapErrors', (errors: Result<ValidationError>) =>
    errors.array().map(error =>
      error.type === 'field'
        ? {
            text: error.msg,
            href: `#${error.path}`,
          }
        : {
            text: error.msg,
          },
    ),
  )

  njkEnv.addGlobal('dpsHomeUrl', config.dpsHomeUrl)
}
