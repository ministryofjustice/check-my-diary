import express, { Router, Express } from 'express'
import bodyParser from 'body-parser'
import path from 'path'
import cookieSession from 'cookie-session'
import { standardRouter } from '../standardRouter'
import { indexRouter } from '../index'

function appSetup(route: Router): Express {
  const app = express()

  app.set('views', path.join(__dirname, '../../views'))
  app.set('view engine', 'ejs')

  app.use((req, res, next) => {
    req.user = {
      employeeName: 'first last',
      authSource: 'nomis',
      token: 'token',
      username: 'user1',
    }
    next()
  })
  app.use(cookieSession({ keys: [''] }))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use('/', route)

  return app
}

export default function appWithAllRoutes(): Express {
  return appSetup(indexRouter(standardRouter()))
}
