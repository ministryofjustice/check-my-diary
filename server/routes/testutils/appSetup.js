/* eslint-disable */

const express = require('express')
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')
const path = require('path')

module.exports = (route, services, reqParams = {}) => {
  const app = express()

  app.set('views', path.join(__dirname, '../../views'))
  app.set('view engine', 'ejs')

  app.set('DataServices', services)

  app.use((req, res, next) => {
    Object.assign(
      req,
      {
        user: {
          firstName: 'first',
          lastName: 'last',
          userId: 'id',
          token: 'token',
          employeeName: 'user1',
        },
      },
      reqParams,
    )
    next()
  })
  app.use(cookieSession({ keys: [''] }))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use('/', route)
  app.use((error, req, res, next) => {
    console.log(error)
  })

  app.set()
  return app
}
