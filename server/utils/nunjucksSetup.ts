/* eslint-disable no-param-reassign */
import nunjucks from 'nunjucks'
import express from 'express'
import * as pathModule from 'path'
import { Result, ValidationError } from 'express-validator'

import { getRelativeModifiedDate, initialiseName } from './utils'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express, path: pathModule.PlatformPath): void {
  app.engine('njk', nunjucks.render)
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'Check my diary'

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
      'node_modules/govuk-frontend/',
      'node_modules/govuk-frontend/components/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/@ministryofjustice/frontend/moj/components/',
    ],
    {
      autoescape: true,
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
    errors.array().map((error) => ({
      text: error.msg,
      href: `#${error.param}`,
    })),
  )
}
