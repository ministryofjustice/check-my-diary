import crypto from 'crypto'
import express, { Router, Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import config from '../config'

export default function setUpWebSecurity(): Router {
  const router = express.Router()

  // Secure code best practice - see:
  // 1. https://expressjs.com/en/advanced/best-practice-security.html,
  // 2. https://www.npmjs.com/package/helmet
  router.use((_req: Request, res: Response, next: NextFunction) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString('hex')
    next()
  })

  const scriptSrc = [
    "'self'",
    '*.google-analytics.com',
    '*.analytics.google.com',
    '*.googletagmanager.com',
    (_req: Request, res: Response) => `'nonce-${res.locals.cspNonce}'`,
  ]
  const formAction = [`'self' ${config.apis.hmppsAuth.externalUrl}`]
  const styleSrc = [
    "'self'",
    '*.google-analytics.com',
    '*.analytics.google.com',
    '*.googletagmanager.com',
    'fonts.googleapis.com',
    (_req: Request, res: Response) => `'nonce-${res.locals.cspNonce}'`,
  ]
  const imgSrc = ["'self'", 'data:', '*.google-analytics.com', '*.analytics.google.com', '*.googletagmanager.com']
  const fontSrc = ["'self'"]

  router.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          connectSrc: [
            "'self'",
            '*.google-analytics.com',
            '*.analytics.google.com',
            '*.googletagmanager.com',
            (_req: Request, res: Response) => `'nonce-${res.locals.cspNonce}'`,
          ],
          formAction,
          scriptSrc,
          styleSrc,
          imgSrc,
          fontSrc,
          ...(config.production ? {} : { upgradeInsecureRequests: null }),
        },
      },
      crossOriginEmbedderPolicy: true,
    }),
  )
  return router
}
