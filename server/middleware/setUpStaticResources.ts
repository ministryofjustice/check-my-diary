import path from 'path'
import compression from 'compression'
import express, { Router } from 'express'
import noCache from 'nocache'

import config from '../../config'

export function setUpStaticResources(): Router {
  const router = express.Router()

  router.use(compression())

  //  Static Resources Configuration
  const cacheControl = { maxAge: config.staticResourceCacheDuration * 1000 }

  Array.of(
    '/assets',
    '/assets/stylesheets',
    '/assets/js',
    `/node_modules/govuk-frontend/govuk/assets`,
    `/node_modules/govuk-frontend`,
    `/node_modules/@ministryofjustice/frontend/`,
  ).forEach((dir) => {
    router.use('/assets', express.static(path.join(process.cwd(), dir), cacheControl))
  })

  Array.of('/node_modules/govuk_frontend_toolkit/images').forEach((dir) => {
    router.use('/assets/images/icons', express.static(path.join(process.cwd(), dir), cacheControl))
  })

  router.use('/assets', express.static(path.join(__dirname, '../assets'), cacheControl))
  router.use('*/images', express.static(path.join(__dirname, '../assets/images'), cacheControl))

  // Don't cache dynamic resources
  router.use(noCache())

  return router
}

export default {
  setUpStaticResources,
}
