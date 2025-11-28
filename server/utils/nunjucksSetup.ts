/* eslint-disable no-param-reassign */
import path from 'path'
import nunjucks from 'nunjucks'
import express from 'express'
import fs from 'fs'
import { Result, ValidationError } from 'express-validator'
import { getRelativeModifiedDate, initialiseName } from './utils'
import config from '../config'
import logger from '../../logger'

export default function nunjucksSetup(app: express.Express): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'Check my diary'
  app.locals.environmentName = config.environmentName
  app.locals.environmentNameColour = config.environmentName === 'PRE-PRODUCTION' ? 'govuk-tag--green' : ''
  let assetManifest: Record<string, string> = {}
  app.locals.googleAnalyticsId = process.env.GOOGLE_ANALYTICS_ID

  try {
    const assetMetadataPath = path.resolve(__dirname, '../../assets/manifest.json')
    assetManifest = JSON.parse(fs.readFileSync(assetMetadataPath, 'utf8'))
  } catch (e) {
    if (process.env.NODE_ENV !== 'test') {
      logger.error(e, 'Could not read asset manifest file')
    }
  }

  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      'node_modules/govuk-frontend/dist/',
      'node_modules/@ministryofjustice/frontend/',
    ],
    {
      autoescape: true,
      express: app,
      noCache: process.env.NODE_ENV !== 'production',
    },
  )

  njkEnv.addFilter('initialiseName', initialiseName)
  njkEnv.addFilter('assetMap', (url: string) => assetManifest[url] || url)
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
