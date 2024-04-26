/* eslint-disable no-param-reassign */
import path from 'path'
import nunjucks from 'nunjucks'
import express from 'express'
import { Result, ValidationError } from 'express-validator'
import { getRelativeModifiedDate, initialiseName } from './utils'
import { ApplicationInfo } from '../applicationInfo'
import config from '../config'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express, applicationInfo: ApplicationInfo): void {
  app.set('view engine', 'njk')
  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'Check my diary'
  app.locals.environmentName = config.environmentName
  app.locals.environmentNameColour = config.environmentName === 'PRE-PRODUCTION' ? 'govuk-tag--green' : ''
  app.locals.googleAnalyticsId = process.env.GOOGLE_ANALYTICS_ID

  // Cachebusting version string
  if (production) {
    // Version only changes with new commits
    app.locals.version = applicationInfo.gitShortHash
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
