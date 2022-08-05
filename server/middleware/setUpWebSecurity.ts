import express, { Router } from 'express'
import helmet from 'helmet'

export default function setUpWebSecurity(): Router {
  const router = express.Router()

  router.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }))
  router.use(helmet.referrerPolicy({ policy: 'same-origin' }))

  return router
}
